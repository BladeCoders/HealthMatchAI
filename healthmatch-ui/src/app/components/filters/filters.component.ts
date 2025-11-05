import { Component, Input, Output, EventEmitter, signal, ElementRef, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-filters',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './filters.component.html',
  styleUrl: './filters.component.css'
})
export class FiltersComponent {
  @Input() locations: string[] = [];
  @Output() filtersChanged = new EventEmitter<{ location: string }>();

  // State for the custom dropdown
  isDropdownOpen = signal(false);
  selectedLocation = signal('all');

  // Inject ElementRef to detect clicks outside
  constructor(private elRef: ElementRef) {}

  // Close dropdown if user clicks outside of it
  @HostListener('document:click', ['$event'])
  onClickOutside(event: MouseEvent) {
    if (!this.elRef.nativeElement.contains(event.target)) {
      this.isDropdownOpen.set(false);
    }
  }

  toggleDropdown() {
    this.isDropdownOpen.set(!this.isDropdownOpen());
  }

  selectLocation(location: string) {
    this.selectedLocation.set(location);
    this.isDropdownOpen.set(false);
    this.filtersChanged.emit({ location: location });
  }

  // Helper to show "All Locations" for 'all'
  getLabel(location: string): string {
    return location === 'all' ? 'All Locations' : location;
  }
}