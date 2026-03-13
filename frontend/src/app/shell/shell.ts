import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { LucideAngularModule, LayoutDashboard, Play, RotateCcw, ChartColumn, Download, History, Settings, LogOut, Search, ArrowDownToLine } from 'lucide-angular';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive, LucideAngularModule],
  templateUrl: './shell.html',
  styleUrl: './shell.css'
})
export class ShellComponent {
  // Expose icons to the template
  readonly LayoutDashboard = LayoutDashboard;
  readonly Play = Play;
  readonly RotateCcw = RotateCcw;
  readonly History = History;
  readonly Download = Download;
  readonly ChartColumn = ChartColumn;
  readonly Settings = Settings;
  readonly LogOut = LogOut;
  readonly Search = Search;
  readonly ArrowDownToLine = ArrowDownToLine;

  userName = 'GrandmasterFlash';
  planType = 'PREMIUM PLAN';
}
