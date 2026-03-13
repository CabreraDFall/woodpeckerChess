import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, ChevronRight, Search, ArrowDownToLine, DownloadCloud, CheckCircle, Monitor, Calendar, Globe, Cpu, Layout, History, Filter } from 'lucide-angular';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, FormsModule],
  templateUrl: './settings.html',
  styleUrl: './settings.css'
})
export class SettingsComponent {
  readonly ChevronRight = ChevronRight;
  readonly Search = Search;
  readonly ArrowDownToLine = ArrowDownToLine;
  readonly DownloadCloud = DownloadCloud;
  readonly CheckCircle = CheckCircle;
  readonly Monitor = Monitor;
  readonly Calendar = Calendar;
  readonly Globe = Globe;
  readonly Cpu = Cpu;
  readonly Layout = Layout;
  readonly History = History;
  readonly Filter = Filter;

  // App Settings
  cycleDuration = signal('1 week');
  maxPuzzles = 100;
  autoGenerate = true;
  theme = 'dark';
  trainingRange = 'Oct 24, 2023 - Nov 07, 2023';

  // Import Settings & State
  selectedSource = signal<'lichess' | 'chess.com'>('lichess');
  selectedTimeControls = signal<string[]>(['blitz']);
  selectedDateRange = signal<string>('7');
  importStatus = signal<'idle' | 'fetching' | 'analyzing' | 'generating' | 'completed'>('idle');
  importProgress = signal(0);
  
  steps = [
    { id: 'fetching', label: 'Downloading Games', stats: '1,420 games' },
    { id: 'analyzing', label: 'Analyzing Positions', stats: 'Stockfish 16.1' },
    { id: 'generating', label: 'Generating Puzzles', stats: '164/250' }
  ];

  setTimeControl(type: string) {
    const current = this.selectedTimeControls();
    if (current.includes(type)) {
      this.selectedTimeControls.set(current.filter(t => t !== type));
    } else {
      this.selectedTimeControls.set([...current, type]);
    }
  }

  fetchGames() {
    this.importStatus.set('fetching');
    this.importProgress.set(0);
    
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

  saveChanges() {
    console.log('Settings saved:', {
      cycleDuration: this.cycleDuration(),
      maxPuzzles: this.maxPuzzles,
      autoGenerate: this.autoGenerate,
      theme: this.theme
    });
  }

  cancel() {
    console.log('Changes cancelled');
  }
}
