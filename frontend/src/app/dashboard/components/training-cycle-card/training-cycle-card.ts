import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, Clock, ChevronRight } from 'lucide-angular';
import { GlassCardComponent } from '../../../shared/components/glass-card/glass-card';
import { ProgressBarComponent } from '../../../shared/components/progress-bar/progress-bar';

@Component({
  selector: 'app-training-cycle-card',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, GlassCardComponent, ProgressBarComponent],
  templateUrl: './training-cycle-card.html',
  styleUrl: './training-cycle-card.css',
})
export class TrainingCycleCardComponent {
  @Input() cycleName: string = 'January Strategic Set';
  @Input() cycleNumber: number = 2;
  @Input() progress: number = 45;
  @Input() totalPuzzles: number = 120;
  @Input() daysRemaining: number = 12;

  readonly Clock = Clock;
  readonly ChevronRight = ChevronRight;

  get progressSublabel(): string {
    return `${this.progress} / ${this.totalPuzzles} puzzles`;
  }
}
