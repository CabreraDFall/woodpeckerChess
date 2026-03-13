import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GlassCardComponent } from '../../../shared/components/glass-card/glass-card';

interface PerformanceStat {
  label: string;
  value: string;
}

@Component({
  selector: 'app-performance-card',
  standalone: true,
  imports: [CommonModule, GlassCardComponent],
  templateUrl: './performance-card.html',
  styleUrl: './performance-card.css',
})
export class PerformanceCardComponent {
  @Input() stats: PerformanceStat[] = [];
}
