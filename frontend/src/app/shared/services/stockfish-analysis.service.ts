import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Chess } from 'chess.js';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class StockfishAnalysisService {
  private stockfish: Worker | null = null;
  private isProcessing = false;
  private gameQueue: any[] = [];
  
  // Current game state
  private currentGameId: string | null = null;
  private isUserWhite = false;
  private currentQueue: { fen: string, move: string, color: string, moveNum: number }[] = [];
  private evaluations: number[] = [];
  private bestMoves: string[] = [];
  private principalVariations: string[] = []; // Capture PV sequence
  private currentEvalIndex = -1;
  private totalMoves = 0;
  private cycleId: string | null = null;
  private maxPuzzles = Infinity;
  private puzzlesGenerated = 0;

  public progress$ = new Subject<{ status: string, count: number, max: number }>();

  constructor(private http: HttpClient) {}

  public processGamesSequence(games: any[], cycleId: string, maxPuzzles: number = Infinity) {
    this.gameQueue.push(...games);
    this.cycleId = cycleId;
    this.maxPuzzles = maxPuzzles;
    this.puzzlesGenerated = 0;

    if (!this.isProcessing) {
      this.initStockfish();
      this.processNextGame();
    }
  }

  private initStockfish() {
    if (this.stockfish) return;

    try {
      this.stockfish = new Worker(
        new URL('../../stockfish.worker', import.meta.url),
        { type: 'module' }
      );

      this.stockfish.onmessage = (event) => {
        const line = event.data;
        if (line.includes('score cp')) {
          const match = line.match(/score cp (-?\d+)/);
          if (match) {
            const cp = parseInt(match[1]);
            const score = cp / 100;
            this.evaluations[this.currentEvalIndex] = score;
            
            // Capture PV from the same line if available
            const pvMatch = line.match(/pv\s+(.+)$/);
            if (pvMatch) {
              this.principalVariations[this.currentEvalIndex] = pvMatch[1];
            }
          }
        } else if (line.startsWith('bestmove')) {
          const match = line.match(/bestmove\s+(\S+)/);
          if (match) {
            this.bestMoves[this.currentEvalIndex] = match[1];
          }
          this.processNextPosition();
        }
      };

      this.stockfish.postMessage('uci');
      this.stockfish.postMessage('isready');
      this.stockfish.postMessage('ucinewgame');
    } catch (e) {
      console.error('[Analysis Service] Error starting Stockfish:', e);
    }
  }

  private processNextGame() {
    if (this.gameQueue.length === 0 || this.puzzlesGenerated >= this.maxPuzzles) {
      this.isProcessing = false;
      this.terminateStockfish();
      console.log(`[Analysis Service] Todo el lote procesado o límite alcanzado (${this.puzzlesGenerated}/${this.maxPuzzles} puzzles)`);
      this.progress$.next({ status: 'completed', count: this.puzzlesGenerated, max: this.maxPuzzles });
      return;
    }

    this.isProcessing = true;
    const game = this.gameQueue.shift();
    this.currentGameId = game.id;
    // We assume Falllorius is the local user name according to db mock requirements
    this.isUserWhite = game.white.toLowerCase().includes('falllorius');
    this.startGameAnalysis(game.pgn);
  }

  private startGameAnalysis(pgn: string) {
    if (!pgn) {
      this.processNextGame();
      return;
    }

    this.currentQueue = [];
    this.evaluations = [];
    this.bestMoves = [];
    this.principalVariations = [];
    this.currentEvalIndex = -1;

    const chess = new Chess();
    const moves = pgn.split(/\s+/).filter((m: string) => !m.includes('.'));

    this.currentQueue.push({ fen: chess.fen(), move: 'start', color: 'none', moveNum: 0 });

    for (let i = 0; i < moves.length; i++) {
      const turn = chess.turn() === 'w' ? 'white' : 'black';
      try {
        chess.move(moves[i]);
        this.currentQueue.push({
          fen: chess.fen(),
          move: moves[i],
          color: turn,
          moveNum: Math.floor(i / 2) + 1
        });
      } catch (e) {
        console.warn('[Analysis Service] Invalid move in PGN:', moves[i]);
      }
    }

    this.totalMoves = this.currentQueue.length;
    
    if (this.totalMoves > 0) {
       this.processNextPosition();
    } else {
       this.processNextGame();
    }
  }

  private processNextPosition() {
    this.currentEvalIndex++;

    if (this.currentEvalIndex < this.currentQueue.length) {
      const item = this.currentQueue[this.currentEvalIndex];
      this.stockfish?.postMessage(`position fen ${item.fen}`);
      this.stockfish?.postMessage('go depth 12');
    } else {
      this.detectAndSaveBlunders();
    }
  }

  private detectAndSaveBlunders() {
    for (let i = 1; i < this.evaluations.length; i++) {
      const item = this.currentQueue[i];
      const prevEval = this.evaluations[i - 1]; 
      const currentEval = this.evaluations[i];

      const absolutePrevEval = Math.abs(prevEval);
      const isWinningBefore = absolutePrevEval > 1.5;
      
      let drop = 0;
      if (item.color === 'white') {
        drop = prevEval - currentEval;
      } else {
        drop = currentEval - prevEval;
      }

      const isUserMove = (item.color === 'white' && this.isUserWhite) ||
                         (item.color === 'black' && !this.isUserWhite);

      if (isUserMove && isWinningBefore && drop > 1.0) {
        if (this.puzzlesGenerated >= this.maxPuzzles) {
            console.log('[Analysis Service] Límite de puzzles alcanzado.');
            break;
        }

        this.puzzlesGenerated++;
        
        const pv = this.principalVariations[i - 1];
        
        this.http.post('http://localhost:3000/api/exercises', {
          gameId: this.currentGameId,
          cycleId: this.cycleId,
          fen: this.currentQueue[i - 1].fen,
          solution: pv || this.bestMoves[i - 1],
          category: 'decisive-advantage-lost',
          difficulty: Math.round(drop * 100)
        }).subscribe({
           next: () => {
             console.log(`[Analysis Service] Ejercicio avanzado guardado (${this.puzzlesGenerated}/${this.maxPuzzles})`);
             this.progress$.next({ status: 'generating', count: this.puzzlesGenerated, max: this.maxPuzzles });
           },
           error: (err) => {
             console.error('[Analysis Service] Error guardando blunder:', err);
           }
        });
      }
    }
    this.processNextGame();
  }

  private terminateStockfish() {
    if (this.stockfish) {
      this.stockfish.terminate();
      this.stockfish = null;
    }
  }
}
