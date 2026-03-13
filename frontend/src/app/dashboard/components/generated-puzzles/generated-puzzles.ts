import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, Filter, Plus } from 'lucide-angular';
import { GlassCardComponent } from '../../../shared/components/glass-card/glass-card';

interface PuzzleEntry {
  id: string;
  status: 'Solved' | 'Not Attempted' | 'Failed';
  source: string;
  attempts: number;
  rating: number;
}

@Component({
  selector: 'app-generated-puzzles',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, GlassCardComponent],
  templateUrl: './generated-puzzles.html',
  styleUrl: './generated-puzzles.css'
})
export class GeneratedPuzzlesComponent {
  readonly Filter = Filter;
  readonly Plus = Plus;

  puzzles: PuzzleEntry[] = [
    { id: 'PZ-1000', status: 'Solved', source: 'Lichess #6010870', attempts: 1, rating: 1400 },
    { id: 'PZ-1001', status: 'Not Attempted', source: 'Lichess #7680764', attempts: 0, rating: 1425 },
    { id: 'PZ-1002', status: 'Not Attempted', source: 'Lichess #8648684', attempts: 0, rating: 1450 },
    { id: 'PZ-1003', status: 'Solved', source: 'Lichess #5532862', attempts: 1, rating: 1475 },
    { id: 'PZ-1004', status: 'Not Attempted', source: 'Lichess #5147042', attempts: 0, rating: 1500 },
    { id: 'PZ-1005', status: 'Failed', source: 'Lichess #1802495', attempts: 3, rating: 1525 },
    { id: 'PZ-1006', status: 'Solved', source: 'Lichess #2931560', attempts: 1, rating: 1550 },
    { id: 'PZ-1007', status: 'Not Attempted', source: 'Lichess #5943044', attempts: 0, rating: 1575 },
    { id: 'PZ-1008', status: 'Not Attempted', source: 'Lichess #6324751', attempts: 0, rating: 1600 },
    { id: 'PZ-1009', status: 'Solved', source: 'Lichess #4004607', attempts: 1, rating: 1625 },
    { id: 'PZ-1010', status: 'Failed', source: 'Lichess #217014', attempts: 3, rating: 1650 },
    { id: 'PZ-1011', status: 'Not Attempted', source: 'Lichess #6649680', attempts: 0, rating: 1675 },
    { id: 'PZ-1012', status: 'Solved', source: 'Lichess #2371154', attempts: 1, rating: 1700 },
    { id: 'PZ-1013', status: 'Not Attempted', source: 'Lichess #5478261', attempts: 0, rating: 1725 },
    { id: 'PZ-1014', status: 'Not Attempted', source: 'Lichess #6898841', attempts: 0, rating: 1750 },
    { id: 'PZ-1015', status: 'Solved', source: 'Lichess #918109', attempts: 1, rating: 1775 },
  ];

  getStatusColor(status: string): string {
    switch (status) {
      case 'Solved': return 'var(--success)';
      case 'Failed': return 'var(--error)';
      default: return 'var(--muted-foreground)';
    }
  }
}
