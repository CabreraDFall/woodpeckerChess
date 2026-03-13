import { Component, OnInit, signal, effect, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { RouterLink } from '@angular/router';

interface Game {
  id: string;
  players: { white: string; black: string };
  moves: string;
  speed: string;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './home.html',
})
export class HomeComponent implements OnInit {
  private http = inject(HttpClient);

  protected games = signal<Game[]>([]);
  protected loading = signal(true);
  protected error = signal<string | null>(null);

  protected analysisStatus = signal('Idle');
  protected bestMove = signal<string | null>(null);
  protected evaluation = signal<string | null>(null);

  private stockfish: Worker | null = null;

  ngOnInit() {
    this.fetchGames();
  }

  private fetchGames() {
    this.http.get<{ count: number; games: Game[] }>('http://localhost:3000/api/games')
      .subscribe({
        next: (data) => {
          this.games.set(data.games);
          this.loading.set(false);
        },
        error: (err) => {
          this.error.set('Failed to load games: ' + err.message);
          this.loading.set(false);
        }
      });
  }
}
