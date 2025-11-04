import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

import { Provider, SpecialtyRecommendation } from './models';

@Injectable({
  providedIn: 'root'
})
export class HealthMatchService {

  private http = inject(HttpClient);

  // The backend API URL from your FastAPI project
  private readonly API_URL = 'http://127.0.0.1:8000';

  // --- STATE MANAGEMENT WITH SIGNALS ---

  // Writable signals to hold our application state
  public readonly recommendation = signal<SpecialtyRecommendation | null>(null);
  public readonly providers = signal<Provider[] | null>(null);
  public readonly selectedSpecialty = signal<string | null>(null);
  public readonly isLoading = signal<boolean>(false);
  public readonly error = signal<string | null>(null);

  // --- PUBLIC API METHODS ---

  /**
   * Calls the FastAPI /symptom-check endpoint (WBS 2.4.1)
   */
  async checkSymptoms(symptoms: string): Promise<void> {
    this.isLoading.set(true);
    this.resetState(); // Clear previous results

    const body = { symptoms };

    try {
      const rec = await firstValueFrom(
        this.http.post<SpecialtyRecommendation>(`${this.API_URL}/symptom-check`, body)
      );
      this.recommendation.set(rec);
    } catch (err) {
      this.handleError(err);
    } finally {
      this.isLoading.set(false);
    }
  }

  /**
   * Calls the FastAPI /providers/{specialty} endpoint (WBS 2.4.2)
   */
  async getProviders(specialty: string): Promise<void> {
    this.isLoading.set(true);
    this.providers.set(null); // Clear only provider list
    this.selectedSpecialty.set(specialty);

    try {
      const providerList = await firstValueFrom(
        this.http.get<Provider[]>(`${this.API_URL}/providers/${specialty}`)
      );
      this.providers.set(providerList);
    } catch (err) {
      this.handleError(err);
    } finally {
      this.isLoading.set(false);
    }
  }

  // --- PRIVATE HELPER METHODS ---

  private resetState(): void {
    this.recommendation.set(null);
    this.providers.set(null);
    this.selectedSpecialty.set(null);
    this.error.set(null);
  }

  private handleError(err: unknown): void {
    if (err instanceof HttpErrorResponse) {
      this.error.set(`API Error (${err.status}): ${err.message}`);
    } else if (err instanceof Error) {
      this.error.set(`An error occurred: ${err.message}`);
    } else {
      this.error.set('An unknown error occurred.');
    }
    console.error(err); // Log the full error
  }
}
