import { Component, OnInit, inject } from '@angular/core';
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

  puzzleNumber = 1;
  totalPuzzles = 0;
  timer = '00:00';
  hintsLeft = 3;
  isCorrect = false;

  exercises: any[] = [];
  currentPuzzleIndex = 0;
  
  moves: Move[] = [];

  // Mock board state
  board: (string | null)[][] = Array(8).fill(null).map(() => Array(8).fill(null));

  private route = inject(ActivatedRoute);
  private http = inject(HttpClient);
  private router = inject(Router);
  private chess = new Chess();

  ngOnInit() {
    const cycleId = this.route.snapshot.paramMap.get('id');
    if (cycleId) {
      this.loadExercises(cycleId);
    }
  }

  loadExercises(cycleId: string) {
    this.http.get<any[]>(`http://localhost:3000/api/exercises/${cycleId}`).subscribe({
      next: (exercises) => {
        this.exercises = exercises;
        this.totalPuzzles = exercises.length;
        if (this.exercises.length > 0) {
          this.setupPuzzle(0);
        }
      },
      error: (err) => console.error('Error loading exercises', err)
    });
  }

  setupPuzzle(index: number) {
    this.currentPuzzleIndex = index;
    this.puzzleNumber = index + 1;
    const exercise = this.exercises[index];
    this.chess.load(exercise.fen);
    this.updateBoard();
    this.isCorrect = false;
    this.moves = []; // Logic to populate moves from PGN or variations can go here
  }

  updateBoard() {
    const boardState = this.chess.board();
    this.board = Array(8).fill(null).map(() => Array(8).fill(null));
    
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const piece = boardState[r][c];
        if (piece) {
          this.board[r][c] = `${piece.color}${piece.type.toUpperCase()}`;
        }
      }
    }
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
