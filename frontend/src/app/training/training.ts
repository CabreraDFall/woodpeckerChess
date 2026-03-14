import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { LucideAngularModule, ChevronLeft, Clock, Lightbulb, RotateCcw, SkipForward, CheckCircle2, ChevronRight } from 'lucide-angular';
import { GlassCardComponent } from '../shared/components/glass-card/glass-card';
import { Chess, Square } from 'chess.js';

interface Move {
  number: number;
  white: string;
  black?: string;
}

@Component({
  selector: 'app-training',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, GlassCardComponent],
  templateUrl: './training.html',
  styleUrl: './training.css'
})
export class TrainingComponent implements OnInit {
  readonly ChevronLeft = ChevronLeft;
  readonly Clock = Clock;
  readonly Lightbulb = Lightbulb;
  readonly RotateCcw = RotateCcw;
  readonly SkipForward = SkipForward;
  readonly CheckCircle2 = CheckCircle2;
  readonly ChevronRight = ChevronRight;

  puzzleNumber = signal(1);
  totalPuzzles = signal(0);
  timer = signal('00:00');
  hintsLeft = signal(3);
  isCorrect = signal(false);
  isLoading = signal(true);

  exercises = signal<any[]>([]);
  currentPuzzleIndex = signal(0);
  selectedSquare = signal<Square | null>(null);
  
  moves = signal<Move[]>([]);
  solutionMoves = signal<string[]>([]);
  currentMoveIndex = signal(0);

  // Board state and visuals
  board = signal<(string | null)[][]>(Array(8).fill(null).map(() => Array(8).fill(null)));
  isFlipped = signal(false);
  legalMoves = signal<Square[]>([]);
  lastMove = signal<{from: Square, to: Square} | null>(null);

  private route = inject(ActivatedRoute);
  private http = inject(HttpClient);
  private router = inject(Router);
  private chess = new Chess();

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const cycleId = params.get('id');
      console.log('[Training] Route parameter id:', cycleId);
      if (cycleId) {
        this.loadExercises(cycleId);
      }
    });
  }

  loadExercises(cycleId: string) {
    this.isLoading.set(true);
    console.log('[Training] Requesting exercises for:', cycleId);
    this.http.get<any[]>(`http://localhost:3000/api/exercises/${cycleId}`).subscribe({
      next: (exercises) => {
        console.log('[Training] Result received. Count:', exercises.length);
        this.exercises.set(exercises);
        this.totalPuzzles.set(exercises.length);
        if (exercises.length > 0) {
          this.setupPuzzle(0);
        }
      },
      error: (err) => {
        console.error('[Training] HTTP Error:', err);
        this.isLoading.set(false);
      },
      complete: () => {
        this.isLoading.set(false);
      }
    });
  }

  setupPuzzle(index: number) {
    this.currentPuzzleIndex.set(index);
    this.puzzleNumber.set(index + 1);
    const exercise = this.exercises()[index];
    this.chess.load(exercise.fen);
    
    // Parse solution sequence
    const sequence = exercise.solution.split(/\s+/);
    this.solutionMoves.set(sequence);
    this.currentMoveIndex.set(0);
    
    // Auto-flip based on turn
    this.isFlipped.set(this.chess.turn() === 'b');
    
    this.updateBoard();
    this.isCorrect.set(false);
    this.moves.set([]); 
    this.selectedSquare.set(null);
    this.legalMoves.set([]);
    this.lastMove.set(null);
  }

  updateBoard() {
    const boardState = this.chess.board();
    const newBoard = Array(8).fill(null).map(() => Array(8).fill(null));
    
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const piece = boardState[r][c];
        if (piece) {
          newBoard[r][c] = `${piece.color}${piece.type.toUpperCase()}`;
        }
      }
    }
    this.board.set(newBoard);
  }

  onSquareClick(row: number, col: number) {
    if (this.isCorrect()) return;

    const square = this.getSquare(row, col);
    
    if (this.selectedSquare()) {
      const from = this.selectedSquare()!;
      try {
        const move = this.chess.move({
          from: from,
          to: square,
          promotion: 'q'
        });

        if (move) {
          const moveLan = move.from + move.to;
          const expectedMove = this.solutionMoves()[this.currentMoveIndex()];
          
          if (moveLan === expectedMove) {
            this.handleCorrectMove(move);
          } else {
            // Wrong move
            this.chess.undo();
            alert('Incorrect move! Try again.');
            this.updateBoard();
            this.selectedSquare.set(null);
            this.legalMoves.set([]);
          }
        } else {
          this.handleSelection(square);
        }
      } catch (e) {
        this.handleSelection(square);
      }
    } else {
      this.handleSelection(square);
    }
  }

  private handleCorrectMove(move: any) {
    this.addMoveToUI(move);
    this.lastMove.set({ from: move.from, to: move.to });
    this.currentMoveIndex.update(idx => idx + 1);
    this.updateBoard();
    this.selectedSquare.set(null);
    this.legalMoves.set([]);

    if (this.currentMoveIndex() === this.solutionMoves().length) {
      this.isCorrect.set(true);
    } else {
      // Opponent response
      setTimeout(() => this.playOpponentMove(), 600);
    }
  }

  private playOpponentMove() {
    const opponentMoveLan = this.solutionMoves()[this.currentMoveIndex()];
    if (!opponentMoveLan) return;

    try {
      const move = this.chess.move({
        from: (opponentMoveLan.substring(0, 2) as any),
        to: (opponentMoveLan.substring(2, 4) as any),
        promotion: (opponentMoveLan.length > 4 ? opponentMoveLan[4] as any : 'q')
      });

      if (move) {
        this.addMoveToUI(move);
        this.lastMove.set({ from: move.from, to: move.to });
        this.currentMoveIndex.update(idx => idx + 1);
        this.updateBoard();

        if (this.currentMoveIndex() === this.solutionMoves().length) {
          this.isCorrect.set(true);
        }
      }
    } catch (e) {
      console.error('[Training] Error playing opponent move:', e);
    }
  }

  isLegalMove(row: number, col: number): boolean {
    const square = this.getSquare(row, col);
    return this.legalMoves().includes(square);
  }

  isLastMove(row: number, col: number): boolean {
    const last = this.lastMove();
    if (!last) return false;
    const square = this.getSquare(row, col);
    return last.from === square || last.to === square;
  }

  handleSelection(square: Square) {
    if (this.isValidSelection(square)) {
      this.selectedSquare.set(square);
      const moves = this.chess.moves({ square, verbose: true });
      this.legalMoves.set(moves.map(m => m.to));
    } else {
      this.selectedSquare.set(null);
      this.legalMoves.set([]);
    }
  }

  isValidSelection(square: Square): boolean {
    const piece = this.chess.get(square);
    return !!piece && piece.color === this.chess.turn();
  }

  addMoveToUI(move: any) {
    const moveText = move.san;
    const currentMoves = this.moves();
    const lastMove = currentMoves[currentMoves.length - 1];
    
    if (!lastMove || lastMove.black) {
      this.moves.update(m => [...m, {
        number: lastMove ? lastMove.number + 1 : 1,
        white: moveText
      }]);
    } else {
      this.moves.update(m => {
        const last = m[m.length - 1];
        last.black = moveText;
        return [...m];
      });
    }
  }

  nextPuzzle() {
    if (this.currentPuzzleIndex() < this.exercises().length - 1) {
      this.setupPuzzle(this.currentPuzzleIndex() + 1);
    } else {
      alert('Training finished!');
      this.goBack();
    }
  }

  getSquare(row: number, col: number): Square {
    const files = 'abcdefgh';
    return (files[col] + (8 - row)) as Square;
  }

  getPieceUrl(piece: string): string {
    const pieceMap: Record<string, string> = {
      'bB': 'assets/img/pieces/bB.77e9debf.svg',
      'bK': 'assets/img/pieces/bK.c5f22c23.svg',
      'bN': 'assets/img/pieces/bN.d0665564.svg',
      'bP': 'assets/img/pieces/bP.09539f32.svg',
      'bQ': 'assets/img/pieces/bQ.5abdb5aa.svg',
      'bR': 'assets/img/pieces/bR.c33a3d54.svg',
      'wB': 'assets/img/pieces/wB.b7d1a118.svg',
      'wK': 'assets/img/pieces/wK.bc7274dd.svg',
      'wN': 'assets/img/pieces/wN.68b788d7.svg',
      'wP': 'assets/img/pieces/wP.0596b7ce.svg',
      'wQ': 'assets/img/pieces/wQ.79c9227e.svg',
      'wR': 'assets/img/pieces/wR.e9e95adc.svg'
    };
    return pieceMap[piece] || '';
  }

  getRank(rowIndex: number): number {
    return 8 - rowIndex;
  }

  getFile(colIndex: number): string {
    return String.fromCharCode(97 + colIndex);
  }

  isDarkSquare(row: number, col: number): boolean {
    return (row + col) % 2 !== 0;
  }

  // Method to navigate back to the training list
  public goBack() {
    this.router.navigate(['/training']);
  }
}
