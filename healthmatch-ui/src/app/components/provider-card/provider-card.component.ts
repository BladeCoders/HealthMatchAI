import { Component, Input, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { Provider } from '../../core/models';

@Component({
  selector: 'app-provider-card',
  standalone: true,
  imports: [CommonModule, DatePipe], // Import DatePipe
  templateUrl: './provider-card.component.html',
  styleUrl: './provider-card.component.css'
})
export class ProviderCardComponent {
  // Use modern @Input({ required: true })
  @Input({ required: true }) provider!: Provider;

  // Fulfills the "Mock Scheduling Modal" WBS item
  onBookDemo(availability: string) {
    alert(`DEMO: Booking appointment for ${this.provider.name} on ${new Date(availability).toLocaleString()}.`);
  }
}
