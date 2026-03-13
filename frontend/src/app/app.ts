import { Component, signal } from '@angular/core';
import { ShellComponent } from './shell/shell';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [ShellComponent],
  template: '<app-shell></app-shell>',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('woodpecker');
}
