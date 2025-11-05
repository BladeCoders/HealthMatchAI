import { Component, inject, signal, OnDestroy, OnInit, Inject, PLATFORM_ID, NgZone, computed } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';

import { HealthMatchService } from '../../core/health-match.service';
import { BookingModalComponent } from '../../components/booking-modal/booking-modal.component';
import { Provider } from '../../core/models';

// --- NEW IMPORTS ---
import { ProviderStubComponent } from '../../components/provider-stub/provider-stub.component';
import { ProviderDetailModalComponent } from '../../components/provider-detail-modal/provider-detail-modal.component';
import { FiltersComponent } from '../../components/filters/filters.component';

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
    BookingModalComponent,
    ProviderStubComponent,         // <-- NEW
    ProviderDetailModalComponent,  // <-- NEW
    FiltersComponent               // <-- NEW
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnDestroy, OnInit { 
  
  public healthService = inject(HealthMatchService);
  private zone = inject(NgZone); 

  // Local signals
  public symptomInput = signal("");
  public isListening = signal(false);
  public isSpeechSupported: boolean = false;
  
  // NEW: Updated placeholder text
  public placeholderText = "e.g., 'Sharp knee pain when I walk up stairs' or 'Persistent cough for a week'";
  
  private recognition: any;

  // --- NEW: State for Modals and Filters ---
  public isProviderModalOpen = signal(false);
  public selectedProvider = signal<Provider | null>(null);
  public activeFilters = signal<{ location: string }>({ location: 'all' });

  // --- NEW: Computed Signals ---
  
  // Get unique locations from the provider list for the filter dropdown
  public availableLocations = computed(() => {
    const providers = this.healthService.providers();
    if (!providers) return [];
    const locations = providers.map(p => p.location);
    return ['all', ...new Set(locations)]; // 'all' + unique locations
  });

  // Create a new list of providers based on the active filters
  public filteredProviders = computed(() => {
    const providers = this.healthService.providers();
    const filters = this.activeFilters();
    if (!providers) return [];
    
    if (filters.location === 'all') {
      return providers; // No filter applied
    }
    
    return providers.filter(p => p.location === filters.location);
  });

  // --- END NEW ---

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      const { SpeechRecognition, webkitSpeechRecognition }: IWindow = (window as any);
      const SpeechAPI = SpeechRecognition || webkitSpeechRecognition;

      if (SpeechAPI) {
        this.isSpeechSupported = true;
        this.recognition = new SpeechAPI();
        this.recognition.continuous = false;
        this.recognition.lang = 'en-US';
        this.recognition.interimResults = true;
        
        this.setupRecognitionEvents();
      } else {
        console.warn("Browser does not support the Web Speech API.");
      }
    }
  }

  private setupRecognitionEvents(): void {
    // This logic remains the same (with NgZone)
    this.recognition.onresult = (event: any) => {
      this.zone.run(() => {
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
        this.symptomInput.set(finalTranscript + interimTranscript);
      });
    };
    this.recognition.onstart = () => { this.zone.run(() => { this.isListening.set(true); }); };
    this.recognition.onend = () => {
      this.zone.run(() => {
        this.isListening.set(false);
        if (this.symptomInput().trim()) { this.onSearch(); }
      });
    };
    this.recognition.onerror = (event: any) => {
      this.zone.run(() => {
        let errorMessage = `Speech recognition error: ${event.error}`;
        if (event.error === 'not-allowed') { errorMessage = 'Microphone access was denied.'; } 
        else if (event.error === 'no-speech') { errorMessage = 'No speech was detected. Please try again.'; }
        this.healthService.error.set(errorMessage);
        this.isListening.set(false);
      });
    };
  }

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
    this.activeFilters.set({ location: 'all' }); // Reset filters
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
  
  // --- NEW: Methods to control the Provider Detail Modal ---
  openProviderModal(provider: Provider) {
    this.selectedProvider.set(provider);
    this.isProviderModalOpen.set(true);
  }
  
  closeProviderModal() {
    this.isProviderModalOpen.set(false);
    // A slight delay so the modal can animate out before content disappears
    setTimeout(() => this.selectedProvider.set(null), 300); 
  }

  // --- NEW: Handle filter changes ---
  onFiltersChanged(filters: { location: string }) {
    this.activeFilters.set(filters);
  }
}