import { Routes } from '@angular/router';
import { HomeComponent } from './home/home';
import { AnalyzeComponent } from './analyze/analyze';
import { DashboardComponent } from './dashboard/dashboard';
import { ImportComponent } from './import/import';
import { AllPuzzlesComponent } from './all-puzzles/all-puzzles';
import { TrainingComponent } from './training/training';
import { SettingsComponent } from './settings/settings';

export const routes: Routes = [
  { path: '', component: DashboardComponent },
  { path: 'home', component: HomeComponent },
  { path: 'analyze/:id', component: AnalyzeComponent },
  { path: 'import', component: ImportComponent },
  { path: 'all-puzzles', component: AllPuzzlesComponent },
  { path: 'training', component: TrainingComponent },
  { path: 'settings', component: SettingsComponent }
];
