import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, Search, ArrowDownToLine, DownloadCloud, CheckCircle, Monitor } from 'lucide-angular';

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
