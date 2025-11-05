import { Component, inject, signal, OnDestroy, OnInit, Inject, PLATFORM_ID, NgZone } from '@angular/core'; // <-- Import NgZone
import { CommonModule, isPlatformBrowser } from '@angular/common';

import { HealthMatchService } from '../../core/health-match.service';
import { ProviderCardComponent } from '../../components/provider-card/provider-card.component';

// Define the interface for the SpeechRecognition API
interface IWindow extends Window {
  SpeechRecognition: any;
  webkitSpeechRecognition: any;
}

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
export class HomeComponent implements OnDestroy, OnInit {

  public healthService = inject(HealthMatchService);
  private zone = inject(NgZone); // <-- Inject NgZone

  // Local signals
  public symptomInput = signal("");
  public isListening = signal(false);
  public isSpeechSupported: boolean = false;
  public placeholderText = "e.g., 'I have a sharp pain in my left knee when I walk up stairs...'";

  private recognition: any;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    // Constructor remains clean
  }

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {

      const { SpeechRecognition, webkitSpeechRecognition }: IWindow = (window as any);
      const SpeechAPI = SpeechRecognition || webkitSpeechRecognition;

      if (SpeechAPI) {
        this.isSpeechSupported = true;
        this.recognition = new SpeechAPI();
        this.recognition.continuous = false;
        this.recognition.lang = 'en-US';
        this.recognition.interimResults = true; // For live typing

        this.setupRecognitionEvents();
      } else {
        console.warn("Browser does not support the Web Speech API.");
      }
    }
  }

  private setupRecognitionEvents(): void {

    // --- UPDATED ---
    // All event logic is wrapped in this.zone.run() to force
    // Angular to run change detection.

    this.recognition.onresult = (event: any) => {
      this.zone.run(() => { // <-- Run inside the zone
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = 0; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }
        // This will now update the UI in real-time
        this.symptomInput.set(finalTranscript + interimTranscript);
      });
    };

    this.recognition.onstart = () => {
      this.zone.run(() => { // <-- Run inside the zone
        this.isListening.set(true);
      });
    };

    this.recognition.onend = () => {
      this.zone.run(() => { // <-- Run inside the zone
        this.isListening.set(false);
        if (this.symptomInput().trim()) {
          this.onSearch();
        }
      });
    };

    this.recognition.onerror = (event: any) => {
      this.zone.run(() => { // <-- Run inside the zone
        let errorMessage = `Speech recognition error: ${event.error}`;
        if (event.error === 'not-allowed') {
          errorMessage = 'Microphone access was denied. Please allow it in your browser settings.';
        } else if (event.error === 'no-speech') {
          errorMessage = 'No speech was detected. Please try again.';
        }
        this.healthService.error.set(errorMessage);
        console.error(errorMessage);
        this.isListening.set(false);
      });
    };
  }

  // --- No changes to the methods below ---

  onSearch() {
    const symptoms = this.symptomInput();
    if (!symptoms) return;
    this.healthService.checkSymptoms(symptoms);
  }

  onSelectSpecialty(specialty: string) {
    this.healthService.getProviders(specialty);
  }

  onClear() {
    this.symptomInput.set("");
    this.healthService.recommendation.set(null);
    this.healthService.providers.set(null);
    this.healthService.error.set(null);
    this.healthService.selectedSpecialty.set(null);
  }

  startSpeechRecognition(): void {
    if (this.isSpeechSupported && !this.isListening()) {
      this.healthService.error.set(null);
      this.recognition.start();
    }
  }

  ngOnDestroy(): void {
    if (this.recognition) {
      this.recognition.abort();
    }
  }
}
