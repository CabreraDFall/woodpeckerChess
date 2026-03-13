import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, ChevronRight } from 'lucide-angular';
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

  cycleDuration = '1 week';
  maxPuzzles = 100;
  autoGenerate = true;
  theme = 'dark';

  saveChanges() {
    console.log('Settings saved:', {
      cycleDuration: this.cycleDuration,
      maxPuzzles: this.maxPuzzles,
      autoGenerate: this.autoGenerate,
      theme: this.theme
    });
  }

  cancel() {
    // Logic to reset settings or navigate back
    console.log('Changes cancelled');
  }
}
