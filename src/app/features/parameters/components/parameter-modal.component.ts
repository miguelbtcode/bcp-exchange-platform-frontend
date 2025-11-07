import { Component, EventEmitter, Input, OnInit, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { Parameter } from '../models/parameter.model';
import { SpinnerService } from '../../../shared/services/spinner.service';
import { ParameterService } from '../services/parameter.service';

interface ParameterFormData {
  id: string;
  code: string;
  description: string;
  longDescription?: string;
  displayOrder: number;
  textValue?: string;
  isParent: boolean;
  parentId?: string;
}

@Component({
  selector: 'app-parameter-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, DialogModule, DropdownModule],
  templateUrl: './parameter-modal.component.html',
  styleUrl: './parameter-modal.component.scss'
})
export class ParameterModalComponent implements OnInit {
  @Input() parameter: Parameter | null = null;
  @Input() visible: boolean = true;
  @Output() save = new EventEmitter<ParameterFormData>();
  @Output() closeModal = new EventEmitter<void>();

  private readonly spinnerService = inject(SpinnerService);
  private readonly parameterService = inject(ParameterService);

  parentParameters: Parameter[] = [];
  parameterTypes = [
    { label: 'Padre', value: true },
    { label: 'Hijo', value: false }
  ];

  formData: ParameterFormData = {
    id: '',
    code: '',
    description: '',
    longDescription: '',
    displayOrder: 0,
    textValue: '',
    isParent: true,
    parentId: undefined
  };

  isEditMode = false;

  ngOnInit() {
    this.loadParentParameters();

    if (this.parameter) {
      this.isEditMode = true;
      this.formData = {
        id: this.parameter.id,
        code: this.parameter.code,
        description: this.parameter.description,
        longDescription: this.parameter.longDescription || '',
        displayOrder: this.parameter.displayOrder,
        textValue: this.parameter.textValue || '',
        isParent: !this.parameter.parentId,
        parentId: this.parameter.parentId || undefined
      };
    }
  }

  loadParentParameters() {
    this.parameterService.getAll().subscribe({
      next: (data) => {
        this.parentParameters = data.filter(p => !p.parentId);
      },
      error: () => {
      }
    });
  }

  onParameterTypeChange() {
    if (this.formData.isParent) {
      this.formData.parentId = undefined;
    }
  }

  onSubmit() {
    if (this.isFormValid()) {
      this.save.emit(this.formData);
    }
  }

  onClose() {
    this.closeModal.emit();
  }

  isFormValid(): boolean {
    const basicValid = !!(
      this.formData.code.trim() &&
      this.formData.description.trim()
    );

    if (!this.formData.isParent && !this.formData.parentId) {
      return false;
    }

    return basicValid;
  }
}
