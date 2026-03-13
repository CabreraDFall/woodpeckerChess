import { Component, OnInit, OnDestroy, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Chess } from 'chess.js';

interface Game {
  id: string;
  players: { white: string; black: string };
  moves: string;
  speed: string;
}

@Component({
  selector: 'app-analyze',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './analyze.html',
})
export class AnalyzeComponent implements OnInit, OnDestroy {
  private http = inject(HttpClient);
  private route = inject(ActivatedRoute);

  protected game = signal<Game | null>(null);
  protected loading = signal(true);
  protected error = signal<string | null>(null);

  protected analysisStatus = signal('Idle');
  protected bestMove = signal<string | null>(null);
  protected evaluation = signal<string | null>(null);

  // Blunder analysis signals
  protected analyzingFullGame = signal(false);
  protected analysisProgress = signal(0);
  protected totalMoves = signal(0);
  protected blunders = signal<any[]>([]);
  
  // Exercise signals
  protected selectedExercise = signal<any | null>(null);
  protected bestLines = signal<any[]>([]);

  private stockfish: Worker | null = null;
  private analysisQueue: { fen: string, move: string, color: string, moveNum: number }[] = [];
  protected currentEvalIndex = -1;
  protected evaluations: number[] = [];
  protected isFallloriusWhite = false;

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.fetchGame(id);
    } else {
      this.error.set('No game ID provided');
      this.loading.set(false);
    }
  }

  ngOnDestroy() {
    this.terminateStockfish();
  }

  private terminateStockfish() {
    if (this.stockfish) {
      this.stockfish.terminate();
      this.stockfish = null;
    }
  }

  private fetchGame(id: string) {
    this.http.get<Game>(`http://localhost:3000/api/game/${id}`)
      .subscribe({
        next: (data) => {
          this.game.set(data);
          this.loading.set(false);
          this.isFallloriusWhite = data.players.white.toLowerCase().includes('falllorius');
          this.initStockfish();
        },
        error: (err) => {
          this.error.set('Failed to load game: ' + err.message);
          this.loading.set(false);
        }
      });
  }

  private initStockfish() {
    try {
      this.stockfish = new Worker(
        new URL('../stockfish.worker', import.meta.url),
        { type: 'module' }
      );

      this.stockfish.onmessage = (event) => {
        const line = event.data;
        if (this.analyzingFullGame() || this.selectedExercise()) {
           console.log('Stockfish:', line);
        }

        if (line.includes('score cp')) {
          const match = line.match(/score cp (-?\d+)/);
          const multiMatch = line.match(/multipv (\d+)/);
          const pvMatch = line.match(/ pv (.+)/);

          if (match) {
            const cp = parseInt(match[1]);
            const score = cp / 100;
            this.evaluation.set(score.toFixed(2));

            if (this.analyzingFullGame()) {
              this.evaluations[this.currentEvalIndex] = score;
            }

            if (this.selectedExercise() && multiMatch && pvMatch) {
              const pvIndex = parseInt(multiMatch[1]) - 1;
              const pvMoves = pvMatch[1].split(' ');
              const displayMoves = pvMoves.slice(0, 6); // 3 full moves (6 plies)

              const currentLines = [...this.bestLines()];
              
              // Ensure we have a placeholder for better index management
              while (currentLines.length <= pvIndex) {
                 currentLines.push(null);
              }

              currentLines[pvIndex] = {
                move: pvMoves[0],
                moves: displayMoves,
                score: score,
                fullLine: pvMatch[1]
              };

              const sortedAll = currentLines
                .filter(l => l !== null)
                .sort((a, b) => b.score - a.score);

              if (sortedAll.length > 0) {
                const bestScore = sortedAll[0].score;
                const filtered = sortedAll.filter((l: any) => Math.abs(bestScore - l.score) <= 0.05);
                this.bestLines.set(filtered);
              }
            }
          }
        } else if (line.startsWith('bestmove')) {
          const parts = line.split(' ');
          this.bestMove.set(parts[1]);

          if (this.analyzingFullGame()) {
            this.processNextInQueue();
          } else {
            this.analysisStatus.set('completed');
          }
        }
      };

      this.stockfish.postMessage('uci');
      this.stockfish.postMessage('isready');
      this.stockfish.postMessage('ucinewgame');
    } catch (e) {
      console.error('Error starting Stockfish:', e);
      this.error.set('Error starting Stockfish: ' + (e as Error).message);
    }
  }

  protected startFullAnalysis() {
    const game = this.game();
    if (!game || !game.moves) return;

    this.analyzingFullGame.set(true);
    this.analysisStatus.set('Analyzing full game...');
    this.evaluations = [];
    this.blunders.set([]);
    this.analysisQueue = [];

    const chess = new Chess();
    const moves = game.moves.split(/\s+/).filter(m => !m.includes('.'));

    // Initial position
    this.analysisQueue.push({ fen: chess.fen(), move: 'start', color: 'none', moveNum: 0 });

    for (let i = 0; i < moves.length; i++) {
      const turn = chess.turn() === 'w' ? 'white' : 'black';
      try {
        chess.move(moves[i]);
        this.analysisQueue.push({
          fen: chess.fen(),
          move: moves[i],
          color: turn,
          moveNum: Math.floor(i / 2) + 1
        });
      } catch (e) {
        console.warn('Invalid move in PGN:', moves[i]);
      }
    }

    this.totalMoves.set(this.analysisQueue.length);
    this.currentEvalIndex = -1;
    this.processNextInQueue();
  }

  private processNextInQueue() {
    this.currentEvalIndex++;
    this.analysisProgress.set(Math.round((this.currentEvalIndex / this.totalMoves()) * 100));

    if (this.currentEvalIndex < this.analysisQueue.length) {
      const item = this.analysisQueue[this.currentEvalIndex];
      this.stockfish?.postMessage(`position fen ${item.fen}`);
      this.stockfish?.postMessage('go depth 12');
    } else {
      this.finishFullAnalysis();
    }
  }

  private finishFullAnalysis() {
    this.analyzingFullGame.set(false);
    this.analysisStatus.set('Analysis complete');
    this.detectBlunders();
  }

  private detectBlunders() {
    const identifiedBlunders = [];
    // evaluations[0] is startpos
    // evaluations[1] is after move 1

    for (let i = 1; i < this.evaluations.length; i++) {
      const item = this.analysisQueue[i];
      const prevEval = this.evaluations[i - 1];
      const currentEval = this.evaluations[i];

      // A blunder is a significant drop for the player who just moved
      let drop = 0;
      if (item.color === 'white') {
        drop = prevEval - currentEval; // If positive, white lost advantage
      } else {
        drop = currentEval - prevEval; // If positive, black lost advantage
      }

      const isUserMove = (item.color === 'white' && this.isFallloriusWhite) ||
        (item.color === 'black' && !this.isFallloriusWhite);

      // Blunder: Significant drop compared to the BEST possible evaluation at that point (prevEval)
      if (isUserMove && drop > 1.0) {
        identifiedBlunders.push({
          fen: this.analysisQueue[i - 1].fen,
          move: item.move,
          drop: drop.toFixed(2),
          evalBefore: prevEval.toFixed(2), // This represents the BEST move's evaluation
          evalAfter: currentEval.toFixed(2), // This represents the user move's evaluation
          moveNumber: item.moveNum,
          color: item.color
        });
      }
    }
    this.blunders.set(identifiedBlunders);
  }

  protected solveExercise(blunder: any) {
    this.selectedExercise.set(blunder);
    this.bestLines.set([]);
    this.analysisStatus.set('Resolviendo ejercicio...');
    
    // Set MultiPV to 3 to see alternatives
    this.stockfish?.postMessage('setoption name MultiPV value 3');
    this.stockfish?.postMessage(`position fen ${blunder.fen}`);
    this.stockfish?.postMessage('go depth 15');
  }

  protected closeExercise() {
    this.selectedExercise.set(null);
    this.bestLines.set([]);
    this.stockfish?.postMessage('setoption name MultiPV value 1');
    this.analysisStatus.set('Idle');
  }
}
