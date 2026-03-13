import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
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
export class DashboardComponent {
  userName = 'GrandmasterFlash';
  planType = 'PREMIUM PLAN';

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
}
