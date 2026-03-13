import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, LayoutDashboard, Play, RotateCcw, ChartColumn, Download, History, Settings, LogOut, Search, Clock, ArrowDownToLine, CheckCircle2, XCircle, ChevronRight } from 'lucide-angular';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class DashboardComponent {
  // Expose icons to the template
  readonly LayoutDashboard = LayoutDashboard;
  readonly Play = Play;
  readonly RotateCcw = RotateCcw;
  readonly History = History;
  readonly Download = Download;
  readonly ChartColumn = ChartColumn;
  readonly Settings = Settings;
  readonly LogOut = LogOut;
  readonly Search = Search;
  readonly Clock = Clock;
  readonly ArrowDownToLine = ArrowDownToLine;
  readonly CheckCircle2 = CheckCircle2;
  readonly XCircle = XCircle;
  readonly ChevronRight = ChevronRight;

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
