import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GeneratedPuzzlesComponent } from '../dashboard/components/generated-puzzles/generated-puzzles';

@Component({
  selector: 'app-all-puzzles',
  standalone: true,
  imports: [CommonModule, GeneratedPuzzlesComponent],
  templateUrl: './all-puzzles.html',
  styleUrl: './all-puzzles.css'
})
export class AllPuzzlesComponent {}
