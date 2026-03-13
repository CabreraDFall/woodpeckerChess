import { Routes } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard';
import { HomeComponent } from './home/home';
import { AnalyzeComponent } from './analyze/analyze';
import { AllPuzzlesComponent } from './all-puzzles/all-puzzles';
import { TrainingComponent } from './training/training';
import { TrainingListComponent } from './training/training-list/training-list';
import { SettingsComponent } from './settings/settings';
import { LandingComponent } from './landing/landing';
import { ShellComponent } from './shell/shell';

export const routes: Routes = [
  { path: '', component: LandingComponent },
  {
    path: '',
    component: ShellComponent,
    children: [
      { path: 'dashboard', component: DashboardComponent },
      { path: 'home', component: HomeComponent },
      { path: 'analyze/:id', component: AnalyzeComponent },
      { path: 'all-puzzles', component: AllPuzzlesComponent },
      { path: 'training', component: TrainingListComponent },
      { path: 'training/session/:id', component: TrainingComponent },
      { path: 'settings', component: SettingsComponent }
    ]
  }
];
