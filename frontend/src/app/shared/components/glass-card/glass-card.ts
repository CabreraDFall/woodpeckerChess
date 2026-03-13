import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-glass-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './glass-card.html',
  styleUrl: './glass-card.css',
})
export class GlassCardComponent {
  @Input() customClass: string = '';
}
