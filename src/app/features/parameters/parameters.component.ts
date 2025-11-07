import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { ConfirmationService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ParameterModalComponent } from './components/parameter-modal.component';
import { ParameterService } from './services/parameter.service';
import { SpinnerService } from '../../shared/services/spinner.service';
import { Parameter } from './models/parameter.model';

@Component({
  selector: 'app-parameters',
  standalone: true,
  imports: [CommonModule, FormsModule, ParameterModalComponent, ConfirmDialogModule],
  templateUrl: './parameters.component.html',
  styleUrl: './parameters.component.scss',
})
export class ParametersComponent implements OnInit {
  private readonly parameterService = inject(ParameterService);
  private readonly toastr = inject(ToastrService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly spinnerService = inject(SpinnerService);
  private readonly confirmationService = inject(ConfirmationService);

  allData: Parameter[] = [];
  filteredData: Parameter[] = [];
  paginatedData: Parameter[] = [];
  loading = false;

  filters = {
    code: '',
    description: '',
  };

  currentPage = 1;
  pageSize = 10;
  totalPages = 1;

  showModal = false;
  selectedParameter: Parameter | null = null;

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.spinnerService.show('Cargando parámetros...');
    this.parameterService.getAll().subscribe({
      next: (data) => {
        this.allData = data;
        this.filteredData = [...this.allData];
        this.updatePagination();
        this.spinnerService.hide();
      },
      error: () => {
        this.toastr.error('Error al cargar los parámetros', 'Error');
        this.spinnerService.hide();
      },
    });
  }

  applyFilters() {
    this.filteredData = this.allData.filter((param) => {
      const matchCode =
        !this.filters.code ||
        param.code.toLowerCase().includes(this.filters.code.toLowerCase());
      const matchName =
        !this.filters.description ||
        param.description.toLowerCase().includes(this.filters.description.toLowerCase());
      return matchCode && matchName;
    });
    this.currentPage = 1;
    this.updatePagination();

    setTimeout(() => this.cdr.detectChanges(), 0);
  }

  clearFilters() {
    this.filters = {
      code: '',
      description: '',
    };
    this.filteredData = [...this.allData];
    this.currentPage = 1;
    this.updatePagination();

    setTimeout(() => this.cdr.detectChanges(), 0);
  }

  updatePagination() {
    this.totalPages = Math.ceil(this.filteredData.length / this.pageSize);
    const start = (this.currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;
    this.paginatedData = this.filteredData.slice(start, end);
  }

  get startIndex(): number {
    return (this.currentPage - 1) * this.pageSize;
  }

  get endIndex(): number {
    return Math.min(this.startIndex + this.pageSize, this.filteredData.length);
  }

  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updatePagination();
    }
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.updatePagination();
    }
  }

  goToPage(page: number) {
    this.currentPage = page;
    this.updatePagination();
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    const maxPages = 5;
    let startPage = Math.max(1, this.currentPage - Math.floor(maxPages / 2));
    const endPage = Math.min(this.totalPages, startPage + maxPages - 1);

    if (endPage - startPage < maxPages - 1) {
      startPage = Math.max(1, endPage - maxPages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  }

  openModal(parameter: Parameter | null = null) {
    this.selectedParameter = parameter;
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
    this.selectedParameter = null;
  }

  onSave(parameter: { id: string; code: string; description: string; longDescription?: string; displayOrder: number; textValue?: string; isParent: boolean; parentId?: string }) {
    if (!parameter.id || parameter.id === '') {
      const createRequest = {
        code: parameter.code,
        description: parameter.description,
        longDescription: parameter.longDescription,
        parentId: parameter.isParent ? undefined : parameter.parentId,
        displayOrder: parameter.displayOrder,
        textValue: parameter.textValue,
        createdBy: 'admin',
      };

      this.spinnerService.show('Creando parámetro...');
      this.parameterService.create(createRequest).subscribe({
        next: () => {
          this.toastr.success('Parámetro creado exitosamente', 'Éxito');
          this.spinnerService.hide();
          this.loadData();
        },
        error: () => {
          this.toastr.error('Error al crear el parámetro', 'Error');
          this.spinnerService.hide();
        },
      });
    } else {
      const updateRequest = {
        description: parameter.description,
        longDescription: parameter.longDescription,
        displayOrder: parameter.displayOrder,
        textValue: parameter.textValue,
        modifiedBy: 'admin',
      };

      this.spinnerService.show('Actualizando parámetro...');
      this.parameterService.update(parameter.id, updateRequest).subscribe({
        next: () => {
          this.toastr.success('Parámetro actualizado exitosamente', 'Éxito');
          this.spinnerService.hide();
          this.loadData();
        },
        error: () => {
          this.toastr.error('Error al actualizar el parámetro', 'Error');
          this.spinnerService.hide();
        },
      });
    }
    this.closeModal();
  }

  deleteParameter(param: Parameter) {
    this.confirmationService.confirm({
      message: `¿Estás seguro de eliminar el parámetro "${param.description}"?`,
      header: 'Confirmar eliminación',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Eliminar',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-danger',
      rejectButtonStyleClass: 'p-button-secondary',
      accept: () => {
        this.spinnerService.show('Eliminando parámetro...');
        this.parameterService.delete(param.id, 'admin').subscribe({
          next: () => {
            this.toastr.success('Parámetro eliminado exitosamente', 'Éxito');
            this.spinnerService.hide();
            this.loadData();
          },
          error: () => {
            this.toastr.error('Error al eliminar el parámetro', 'Error');
            this.spinnerService.hide();
          },
        });
      }
    });
  }

  trackByParameterId(_index: number, param: Parameter): string {
    return param.id;
  }
}
