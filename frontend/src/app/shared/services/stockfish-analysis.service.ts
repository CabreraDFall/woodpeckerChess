import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Chess } from 'chess.js';

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
  private currentEvalIndex = -1;
  private totalMoves = 0;
  private cycleId: string | null = null;

  constructor(private http: HttpClient) {}

  public processGamesSequence(games: any[], cycleId: string) {
    this.gameQueue.push(...games);
    this.cycleId = cycleId;

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
          }
        } else if (line.startsWith('bestmove')) {
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
    if (this.gameQueue.length === 0) {
      this.isProcessing = false;
      this.terminateStockfish();
      console.log('[Analysis Service] Todo el lote procesado');
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
      const prevEval = this.evaluations[i - 1]; // Evaluación del turno previo
      const currentEval = this.evaluations[i];

      let drop = 0;
      if (item.color === 'white') {
        drop = prevEval - currentEval; // Si la eval baja, el blanco perdió
      } else {
        drop = currentEval - prevEval; // Si la eval sube, el negro perdió
      }

      const isUserMove = (item.color === 'white' && this.isUserWhite) ||
                         (item.color === 'black' && !this.isUserWhite);

      if (isUserMove && drop > 1.0) {
        // Enviar POST por cada blunder detectado al backend
        this.http.post('http://localhost:3000/api/exercises', {
          gameId: this.currentGameId,
          fen: this.currentQueue[i - 1].fen, // La posición ANTES del blunder, para que el usuario encuentre la táctica
          solution: 'Mejor movimiento a derivar', // Para la Fase 2, un blunder es un ejercicio
          category: 'blunder',
          difficulty: Math.round(drop * 100)
        }).subscribe({
           error: (err) => console.error('[Analysis Service] Error guardando blunder:', err)
        });
      }
    }
    // Análisis del juego actual completado, pasar al siguiente
    this.processNextGame();
  }

  private terminateStockfish() {
    if (this.stockfish) {
      this.stockfish.terminate();
      this.stockfish = null;
    }
  }
}
