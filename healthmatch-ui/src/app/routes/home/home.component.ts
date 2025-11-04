import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

import { HealthMatchService } from '../../core/health-match.service';
import { ProviderCardComponent } from '../../components/provider-card/provider-card.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    ProviderCardComponent
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {

  // Inject the service
  public healthService = inject(HealthMatchService);

  // Local signal for the form input
  public symptomInput = signal("");

  onSearch() {
    const symptoms = this.symptomInput();
    if (!symptoms) return; // Don't search if empty

    // Call the service method
    this.healthService.checkSymptoms(symptoms);
  }

  onSelectSpecialty(specialty: string) {
    // Call the service method
    this.healthService.getProviders(specialty);
  }

  onClear() {
    this.symptomInput.set("");
    // We can add a public reset method to the service if needed
    this.healthService.recommendation.set(null);
    this.healthService.providers.set(null);
    this.healthService.error.set(null);
    this.healthService.selectedSpecialty.set(null);
  }
}
