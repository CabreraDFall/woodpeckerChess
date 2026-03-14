import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { LucideAngularModule, Search, ArrowDownToLine, DownloadCloud, CheckCircle, Monitor } from 'lucide-angular';
import { StockfishAnalysisService } from '../shared/services/stockfish-analysis.service';

@Component({
  selector: 'app-import',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './import.html',
  styleUrl: './import.css',
})
export class ImportComponent {
  // Expose icons to the template
  readonly Search = Search;
  readonly ArrowDownToLine = ArrowDownToLine;
  readonly DownloadCloud = DownloadCloud;
  readonly CheckCircle = CheckCircle;
  readonly Monitor = Monitor;
  private http = inject(HttpClient);
  private analysisService = inject(StockfishAnalysisService);

  userName = 'GrandmasterFlash';
  planType = 'PREMIUM PLAN';

  selectedTimeControls = signal<string[]>(['blitz']);
  selectedDateRange = signal<string>('7');
  
  importStatus = signal<'idle' | 'fetching' | 'analyzing' | 'generating' | 'completed'>('idle');
  importProgress = signal(0);
  
  steps = [
    { id: 'fetching', label: 'Downloading Games', icon: DownloadCloud },
    { id: 'analyzing', label: 'Analyzing Positions', icon: Search },
    { id: 'generating', label: 'Generating Puzzles', icon: CheckCircle }
  ];

  setTimeControl(type: string) {
    const current = this.selectedTimeControls();
    if (current.includes(type)) {
      // Don't allow empty selection if you want at least one selected, 
      // or allow it if 'none' is valid. Let's allow empty for now.
      this.selectedTimeControls.set(current.filter(t => t !== type));
    } else {
      this.selectedTimeControls.set([...current, type]);
    }
  }

  fetchGames() {
    this.importStatus.set('fetching');
    this.importProgress.set(10);
    
    this.http.post('http://localhost:3000/api/games/sync', { username: this.userName })
      .subscribe({
        next: (response: any) => {
          this.importProgress.set(100);
          this.importStatus.set('completed');
          console.log('Games synced:', response);
          if (response.games && response.trainingCycleId) {
            this.analysisService.processGamesSequence(response.games, response.trainingCycleId);
            this.importStatus.set('analyzing');
          }
        },
        error: (err) => {
          console.error('Sync failed:', err);
          this.importStatus.set('idle');
          alert('Failed to sync games. Make sure the backend is running.');
        }
      });
  }
}
