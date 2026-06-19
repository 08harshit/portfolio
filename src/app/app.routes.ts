import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home.component';
import { ArticleComponent } from './pages/article.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'article/:id', component: ArticleComponent },
  { path: '**', redirectTo: '' }
];
