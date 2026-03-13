import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GlassCardComponent } from '../../../shared/components/glass-card/glass-card';

@Component({
  selector: 'app-weekly-accuracy-card',
  standalone: true,
  imports: [CommonModule, GlassCardComponent],
  templateUrl: './weekly-accuracy-card.html',
  styleUrl: './weekly-accuracy-card.css',
})
export class WeeklyAccuracyCardComponent {}
