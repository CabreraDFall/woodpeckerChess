import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, Search, ArrowDownToLine, DownloadCloud, CheckCircle } from 'lucide-angular';

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

  userName = 'GrandmasterFlash';
  planType = 'PREMIUM PLAN';

  selectedTimeControl = signal<'bullet' | 'blitz' | 'rapid' | null>('blitz');
  selectedDateRange = signal<string>('7');
  
  importStatus = signal<'idle' | 'fetching' | 'analyzing' | 'generating' | 'completed'>('idle');
  importProgress = signal(0);
  
  steps = [
    { id: 'fetching', label: 'Downloading Games', icon: DownloadCloud },
    { id: 'analyzing', label: 'Analyzing Positions', icon: Search },
    { id: 'generating', label: 'Generating Puzzles', icon: CheckCircle }
  ];

  setTimeControl(type: 'bullet' | 'blitz' | 'rapid') {
    this.selectedTimeControl.set(type);
  }

  fetchGames() {
    this.importStatus.set('fetching');
    this.importProgress.set(0);
    
    // Simulate progress
    const interval = setInterval(() => {
      const current = this.importProgress();
      if (current < 100) {
        this.importProgress.set(current + 2);
        
        if (current < 30) {
          this.importStatus.set('fetching');
        } else if (current < 80) {
          this.importStatus.set('analyzing');
        } else {
          this.importStatus.set('generating');
        }
      } else {
        this.importStatus.set('completed');
        clearInterval(interval);
      }
    }, 100);
  }
}
