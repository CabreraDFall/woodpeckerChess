import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { WelcomeHeaderComponent } from './components/welcome-header/welcome-header';
import { TrainingCycleCardComponent } from './components/training-cycle-card/training-cycle-card';
import { PerformanceCardComponent } from './components/performance-card/performance-card';
import { RecentPuzzlesCardComponent } from './components/recent-puzzles-card/recent-puzzles-card';
import { WeeklyAccuracyCardComponent } from './components/weekly-accuracy-card/weekly-accuracy-card';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule, 
    WelcomeHeaderComponent, 
    TrainingCycleCardComponent,
    PerformanceCardComponent,
    RecentPuzzlesCardComponent,
    WeeklyAccuracyCardComponent
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class DashboardComponent implements OnInit {
  private http = inject(HttpClient);
  
  userName = 'GrandmasterFlash';
  planType = 'PREMIUM PLAN';
  
  // Dynamic Cycle Data
  cycleName = 'Loading Cycle...';
  cycleNumber = 1;
  totalPuzzles = 0;
  progress = 0;

  recentPuzzles = [
    { id: 'PZ-1000', name: 'Lichess #2159803', rating: 1400, success: true },
    { id: 'PZ-1001', name: 'Lichess #6701061', rating: 1425, success: false },
    { id: 'PZ-1002', name: 'Lichess #471445', rating: 1450, success: false },
    { id: 'PZ-1003', name: 'Lichess #3407478', rating: 1475, success: true },
    { id: 'PZ-1004', name: 'Lichess #2387064', rating: 1500, success: false },
  ];

  performanceStats = [
    { label: 'Puzzle Accuracy', value: '78.4%' },
    { label: 'Avg. Solving Time', value: '42.5s' },
    { label: 'Total Solved', value: '1,429' },
  ];

  ngOnInit() {
    // 1. Fetch Training Cycles
    this.http.get<any[]>('http://localhost:3000/api/training-cycles')
      .subscribe({
        next: (cycles) => {
          if (cycles && cycles.length > 0) {
            const activeCycle = cycles[0];
            this.cycleName = activeCycle.name;
            
            // 2. Fetch the exercises (blunders) for this cycle to get the total count
            this.http.get<any[]>(`http://localhost:3000/api/exercises/${activeCycle.id}`)
              .subscribe({
                next: (exercises) => {
                  this.totalPuzzles = exercises.length;
                  // For now progress is mock as we dont have solved status yet
                  this.progress = 0; 
                },
                error: (err) => console.error('Failed to get exercises', err)
              });
          } else {
            this.cycleName = 'No Active Training Cycle';
          }
        },
        error: (err) => console.error('Failed to get training cycles', err)
      });
  }
}
