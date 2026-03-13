import { Routes } from '@angular/router';
import { HomeComponent } from './home/home';
import { AnalyzeComponent } from './analyze/analyze';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'analyze/:id', component: AnalyzeComponent }
];
