import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { LucideAngularModule, ChevronRight, Search, ArrowDownToLine, DownloadCloud, CheckCircle, Monitor, Calendar, Globe, Cpu, Layout, History, Filter } from 'lucide-angular';
import { FormsModule } from '@angular/forms';
import { StockfishAnalysisService } from '../shared/services/stockfish-analysis.service';

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
  private http = inject(HttpClient);
  private analysisService = inject(StockfishAnalysisService);

  // App Settings
  cycleDuration = signal('1 week');
  maxPuzzles = 100;
  autoGenerate = true;
  theme = 'dark';
  trainingRange = 'Feb 01, 2026 - Mar 31, 2026';

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
    this.importProgress.set(10);
    
    // Using hardcoded userName for now as per current logic, 
    // but in a real app this would come from a profile setting
    const userName = 'falllorius'; 

    this.http.post('http://localhost:3000/api/games/sync', { username: userName })
      .subscribe({
        next: (response: any) => {
          this.importProgress.set(100);
          this.importStatus.set('completed');
          
          // Log the count of games to the console as requested
          const gameCount = response.games?.length || 0;
          console.log(`Successfully fetched and synced ${gameCount} games from Lichess.`);
          
          // Update step stats if they exist
          this.steps[0].stats = `${gameCount} games`;

          // Trigger local stockfish blunder analysis phase
          if (response.games && response.trainingCycleId) {
             this.analysisService.processGamesSequence(response.games, response.trainingCycleId);
             this.importStatus.set('analyzing');
          }
        },
        error: (err) => {
          console.error('Fetch failed:', err);
          this.importStatus.set('idle');
          this.importProgress.set(0);
        }
      });
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
