import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Provider } from '../../core/models';

@Component({
  selector: 'app-provider-stub',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './provider-stub.component.html',
  styleUrl: './provider-stub.component.css'
})
export class ProviderStubComponent {
  @Input({ required: true }) provider!: Provider;
  @Output() scheduleClicked = new EventEmitter<Provider>();

  onScheduleClick() {
    this.scheduleClicked.emit(this.provider);
  }
}