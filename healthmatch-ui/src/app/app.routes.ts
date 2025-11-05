import { Routes } from '@angular/router';
import { HomeComponent } from './routes/home/home.component';
import { LandingComponent } from './routes/landing/landing.component'; // Import LandingComponent

export const routes: Routes = [
  { path: '', component: LandingComponent }, // Set landing page as default
  { path: 'home', component: HomeComponent }, // Your existing home/search page
  { path: '**', redirectTo: '' } // Redirect any unknown routes to landing
];