import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, Play } from 'lucide-angular';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, FormsModule],
  templateUrl: './landing.html',
  styleUrl: './landing.css'
})
export class LandingComponent {
  readonly Play = Play;
  lichessUsername: string = '';

  constructor(private router: Router) {}

  connectWithLichess() {
    if (this.lichessUsername.trim()) {
      // In a real app, we'd save this to a store or service
      console.log('Connecting with Lichess user:', this.lichessUsername);
      this.router.navigate(['/settings']);
    } else {
      alert('Please enter your Lichess username');
    }
  }
}
