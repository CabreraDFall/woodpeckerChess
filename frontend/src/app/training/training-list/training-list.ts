import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
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
export class TrainingListComponent implements OnInit {
  readonly Play = Play;
  readonly Clock = Clock;
  readonly CheckCircle2 = CheckCircle2;
  
  private http = inject(HttpClient);

  trainingCycles: TrainingCycle[] = [];

  constructor(private router: Router) {}

  ngOnInit() {
    this.http.get<any[]>('http://localhost:3000/api/training-cycles').subscribe({
      next: (cycles) => {
        // Map backend cycles to frontend interface
        this.trainingCycles = cycles.map(c => ({
          id: c.id,
          name: c.name,
          progress: 0,
          totalPuzzles: 0,
          completedPuzzles: 0,
          lastPlayed: 'Never',
          frequency: 'Monthly'
        }));

        // For each cycle, get the total number of puzzles
        this.trainingCycles.forEach(cycle => {
           this.http.get<any[]>(`http://localhost:3000/api/exercises/${cycle.id}`).subscribe({
             next: (exercises) => {
               cycle.totalPuzzles = exercises.length;
               // Opcionalmente, calcularíamos progress aquí si existiera en la db
             }
           });
        });
      },
      error: (err) => console.error('Failed to load training cycles', err)
    });
  }

  startSession(cycleId: string) {
    this.router.navigate(['/training/session', cycleId]);
  }
}
