import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { LucideAngularModule, ChevronLeft, Clock, Lightbulb, RotateCcw, SkipForward, CheckCircle2, ChevronRight } from 'lucide-angular';
import { GlassCardComponent } from '../shared/components/glass-card/glass-card';

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
export class TrainingComponent {
  readonly ChevronLeft = ChevronLeft;
  readonly Clock = Clock;
  readonly Lightbulb = Lightbulb;
  readonly RotateCcw = RotateCcw;
  readonly SkipForward = SkipForward;
  readonly CheckCircle2 = CheckCircle2;
  readonly ChevronRight = ChevronRight;

  puzzleNumber = 23;
  totalPuzzles = 120;
  timer = '01:42';
  hintsLeft = 2;
  isCorrect = false; // Toggle for testing success view

  moves: Move[] = [
    { number: 1, white: 'e4', black: 'c5' },
    { number: 2, white: 'Nf3', black: 'd6' },
    { number: 3, white: 'd4', black: 'cxd4' },
    { number: 4, white: 'Nxd4' },
  ];

  // Mock board state
  board: (string | null)[][] = Array(8).fill(null).map(() => Array(8).fill(null));

  constructor(private router: Router) {
    // Standard chess starting position
    // Black pieces
    this.board[0] = ['bR', 'bN', 'bB', 'bQ', 'bK', 'bB', 'bN', 'bR'];
    this.board[1] = ['bP', 'bP', 'bP', 'bP', 'bP', 'bP', 'bP', 'bP'];
    
    // White pieces
    this.board[6] = ['wP', 'wP', 'wP', 'wP', 'wP', 'wP', 'wP', 'wP'];
    this.board[7] = ['wR', 'wN', 'wB', 'wQ', 'wK', 'wB', 'wN', 'wR'];
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

  goBack() {
    this.router.navigate(['/training']);
  }
}
