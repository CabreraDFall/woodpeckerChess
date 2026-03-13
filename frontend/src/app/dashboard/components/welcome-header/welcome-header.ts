import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, ArrowDownToLine } from 'lucide-angular';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-welcome-header',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, RouterLink],
  templateUrl: './welcome-header.html',
  styleUrl: './welcome-header.css',
})
export class WelcomeHeaderComponent {
  @Input() userName: string = '';
  
  readonly ArrowDownToLine = ArrowDownToLine;
}
