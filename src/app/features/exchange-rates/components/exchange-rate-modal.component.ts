import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { ExchangeRate } from '../models/exchange-rate.model';
import { Parameter } from '../../parameters/models/parameter.model';

interface ExchangeRateFormData {
  id: string;
  rate: number;
  currencySourceId: string;
  currencyTargetId: string;
}

@Component({
  selector: 'app-exchange-rate-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, DialogModule, DropdownModule],
  templateUrl: './exchange-rate-modal.component.html',
  styleUrl: './exchange-rate-modal.component.scss'
})
export class ExchangeRateModalComponent implements OnInit {
  @Input() exchangeRate: ExchangeRate | null = null;
  @Input() currencies: Parameter[] = [];
  @Input() visible: boolean = true;
  @Output() save = new EventEmitter<ExchangeRateFormData>();
  @Output() closeModal = new EventEmitter<void>();

  formData: ExchangeRateFormData = {
    id: '',
    rate: 0,
    currencySourceId: '',
    currencyTargetId: ''
  };

  isEditMode = false;

  ngOnInit() {
    if (this.exchangeRate) {
      this.isEditMode = true;
      this.formData = {
        id: this.exchangeRate.id,
        rate: this.exchangeRate.rate,
        currencySourceId: this.exchangeRate.currencySourceId,
        currencyTargetId: this.exchangeRate.currencyTargetId
      };
    }
  }

  onSubmit() {
    if (this.isFormValid()) {
      this.save.emit(this.formData);
    }
  }

  isFormValid(): boolean {
    return !!(
      this.formData.currencySourceId &&
      this.formData.currencyTargetId &&
      this.formData.rate > 0 &&
      this.formData.currencySourceId !== this.formData.currencyTargetId
    );
  }

  onClose() {
    this.closeModal.emit();
  }
}
