import { Routes } from '@angular/router';
import { HomeComponent } from './home/home';
import { AnalyzeComponent } from './analyze/analyze';
import { DashboardComponent } from './dashboard/dashboard';
import { ImportComponent } from './import/import';

export const routes: Routes = [
  { path: '', component: DashboardComponent },
  { path: 'home', component: HomeComponent },
  { path: 'analyze/:id', component: AnalyzeComponent },
  { path: 'import', component: ImportComponent }
];
