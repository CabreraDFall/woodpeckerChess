import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, Play, Clock, CheckCircle2 } from 'lucide-angular';
import { Router } from '@angular/router';
import { GlassCardComponent } from '../../shared/components/glass-card/glass-card';

interface TrainingCycle {
  id: string;
  name: string;
  progress: number;
  totalPuzzles: number;
  completedPuzzles: number;
  lastPlayed: string;
  frequency: string;
}

@Component({
  selector: 'app-training-list',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, GlassCardComponent],
  templateUrl: './training-list.html',
  styleUrl: './training-list.css'
})
export class TrainingListComponent {
  readonly Play = Play;
  readonly Clock = Clock;
  readonly CheckCircle2 = CheckCircle2;

  trainingCycles: TrainingCycle[] = [
    {
      id: '1',
      name: 'January Strategic Set',
      progress: 45,
      totalPuzzles: 120,
      completedPuzzles: 54,
      lastPlayed: '2h ago',
      frequency: 'Weekly'
    },
    {
      id: '2',
      name: 'Endgame Mastery',
      progress: 10,
      totalPuzzles: 50,
      completedPuzzles: 5,
      lastPlayed: '1d ago',
      frequency: 'Monthly'
    },
    {
      id: '3',
      name: 'Daily Tactics Routine',
      progress: 100,
      totalPuzzles: 20,
      completedPuzzles: 20,
      lastPlayed: '3h ago',
      frequency: 'Daily'
    }
  ];

  constructor(private router: Router) {}

  startSession(cycleId: string) {
    this.router.navigate(['/training/session', cycleId]);
  }
}
