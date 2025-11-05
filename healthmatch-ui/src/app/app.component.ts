import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common'; // <-- Import
import { NavigationEnd, Router, RouterLink, RouterOutlet } from '@angular/router'; // <-- Import
import { filter } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule, // <-- Add
    RouterOutlet,
    RouterLink    // <-- Add
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'HealthMatch AI'; // Simplified title
  router = inject(Router);
  currentUrl = signal('');

  constructor() {
    // This watches the URL and updates the signal
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      this.currentUrl.set(event.urlAfterRedirects);
    });
  }
}