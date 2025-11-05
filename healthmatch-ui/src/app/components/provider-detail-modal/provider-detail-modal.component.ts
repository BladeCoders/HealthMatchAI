import { Component, Input, Output, EventEmitter, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { Provider } from '../../core/models';
import { BookingModalComponent } from '../booking-modal/booking-modal.component';

@Component({
  selector: 'app-provider-detail-modal',
  standalone: true,
  imports: [CommonModule, DatePipe, BookingModalComponent],
  templateUrl: './provider-detail-modal.component.html',
  styleUrl: './provider-detail-modal.component.css'
})
export class ProviderDetailModalComponent {
  @Input({ required: true }) provider!: Provider | null;
  @Output() closeModal = new EventEmitter<void>();

  // Internal state for the "Congratulations" modal
  isBookingModalOpen = signal(false);
  selectedSlot = signal<string | null>(null);

  onClose() {
    this.closeModal.emit();
  }

  openBookingModal(slot: string) {
    this.selectedSlot.set(slot);
    this.isBookingModalOpen.set(true);
  }

  closeBookingModal() {
    this.isBookingModalOpen.set(false);
  }
}