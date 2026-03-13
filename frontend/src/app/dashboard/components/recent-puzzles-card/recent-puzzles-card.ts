import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, CheckCircle2, XCircle } from 'lucide-angular';
import { GlassCardComponent } from '../../../shared/components/glass-card/glass-card';

interface Puzzle {
  id: string;
  name: string;
  rating: number;
  success: boolean;
}

@Component({
  selector: 'app-recent-puzzles-card',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, GlassCardComponent],
  templateUrl: './recent-puzzles-card.html',
  styleUrl: './recent-puzzles-card.css',
})
export class RecentPuzzlesCardComponent {
  @Input() puzzles: Puzzle[] = [];

  readonly CheckCircle2 = CheckCircle2;
  readonly XCircle = XCircle;
}
