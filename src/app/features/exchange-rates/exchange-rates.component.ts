import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { ConfirmationService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DropdownModule } from 'primeng/dropdown';
import { ExchangeRateModalComponent } from './components/exchange-rate-modal.component';
import { ExchangeRateService } from './services/exchange-rate.service';
import { ParameterService } from '../parameters/services/parameter.service';
import { SpinnerService } from '../../shared/services/spinner.service';
import { ExchangeRate } from './models/exchange-rate.model';
import { Parameter } from '../parameters/models/parameter.model';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-exchange-rates',
  standalone: true,
  imports: [CommonModule, FormsModule, ExchangeRateModalComponent, ConfirmDialogModule, DropdownModule],
  templateUrl: './exchange-rates.component.html',
  styleUrl: './exchange-rates.component.scss'
})
export class ExchangeRatesComponent implements OnInit {
  private readonly exchangeRateService = inject(ExchangeRateService);
  private readonly parameterService = inject(ParameterService);
  private readonly toastr = inject(ToastrService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly spinnerService = inject(SpinnerService);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly authService = inject(AuthService);

  canEdit = false;
  allData: ExchangeRate[] = [];
  filteredData: ExchangeRate[] = [];
  paginatedData: ExchangeRate[] = [];
  currencies: Parameter[] = [];

  filters = {
    sourceCurrencyId: '',
    targetCurrencyId: ''
  };

  currentPage = 1;
  pageSize = 10;
  totalPages = 1;

  showModal = false;
  selectedRate: ExchangeRate | null = null;

  ngOnInit() {
    this.canEdit = this.authService.canEdit();
    this.loadCurrencies();
    this.loadData();
  }

  loadCurrencies() {
    this.spinnerService.show('Cargando monedas...');
    this.parameterService.getByParentCode('CURRENCY').subscribe({
      next: (data) => {
        this.currencies = data;
        this.spinnerService.hide();
      },
      error: () => {
        this.toastr.error('Error al cargar las monedas', 'Error');
        this.spinnerService.hide();
      }
    });
  }

  loadData() {
    this.spinnerService.show('Cargando tipos de cambio...');
    this.exchangeRateService.getAll().subscribe({
      next: (data) => {
        this.allData = data;
        this.filteredData = [...this.allData];
        this.updatePagination();
        this.spinnerService.hide();
      },
      error: () => {
        this.toastr.error('Error al cargar los tipos de cambio', 'Error');
        this.spinnerService.hide();
      }
    });
  }

  applyFilters() {
    this.filteredData = this.allData.filter(rate => {
      const matchSource = !this.filters.sourceCurrencyId || rate.currencySourceId === this.filters.sourceCurrencyId;
      const matchTarget = !this.filters.targetCurrencyId || rate.currencyTargetId === this.filters.targetCurrencyId;
      return matchSource && matchTarget;
    });
    this.currentPage = 1;
    this.updatePagination();

    setTimeout(() => this.cdr.detectChanges(), 0);
  }

  clearFilters() {
    this.filters = {
      sourceCurrencyId: '',
      targetCurrencyId: ''
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

  openModal(rate: ExchangeRate | null = null) {
    this.selectedRate = rate;
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
    this.selectedRate = null;
  }

  onSave(exchangeRate: { id: string; rate: number; currencySourceId: string; currencyTargetId: string }) {
    if (!exchangeRate.id || exchangeRate.id === '') {
      const createRequest = {
        rate: exchangeRate.rate,
        currencySourceId: exchangeRate.currencySourceId,
        currencyTargetId: exchangeRate.currencyTargetId,
        createdBy: 'admin'
      };

      this.spinnerService.show('Creando tipo de cambio...');
      this.exchangeRateService.create(createRequest).subscribe({
        next: () => {
          this.toastr.success('Tipo de cambio creado exitosamente', 'Éxito');
          this.spinnerService.hide();
          this.loadData();
        },
        error: () => {
          this.spinnerService.hide();
        }
      });
    } else {
      const updateRequest = {
        rate: exchangeRate.rate,
        currencySourceId: exchangeRate.currencySourceId,
        currencyTargetId: exchangeRate.currencyTargetId,
        modifiedBy: 'admin'
      };

      this.spinnerService.show('Actualizando tipo de cambio...');
      this.exchangeRateService.update(exchangeRate.id, updateRequest).subscribe({
        next: () => {
          this.toastr.success('Tipo de cambio actualizado exitosamente', 'Éxito');
          this.spinnerService.hide();
          this.loadData();
        },
        error: () => {
          this.spinnerService.hide();
        }
      });
    }
    this.closeModal();
  }

  deleteRate(rate: ExchangeRate) {
    const sourceCurrency = this.currencies.find(c => c.id === rate.currencySourceId);
    const targetCurrency = this.currencies.find(c => c.id === rate.currencyTargetId);
    const displayName = `${sourceCurrency?.code || 'N/A'} → ${targetCurrency?.code || 'N/A'}`;

    this.confirmationService.confirm({
      message: `¿Estás seguro de eliminar el tipo de cambio "${displayName}"?`,
      header: 'Confirmar eliminación',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Eliminar',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-danger',
      rejectButtonStyleClass: 'p-button-secondary',
      accept: () => {
        this.spinnerService.show('Eliminando tipo de cambio...');
        this.exchangeRateService.delete(rate.id, 'admin').subscribe({
          next: () => {
            this.toastr.success('Tipo de cambio eliminado exitosamente', 'Éxito');
            this.spinnerService.hide();
            this.loadData();
          },
          error: () => {
            this.spinnerService.hide();
          }
        });
      }
    });
  }

  trackByExchangeRateId(_index: number, rate: ExchangeRate): string {
    return rate.id;
  }

  getCurrencyCode(currencyId: string): string {
    return this.currencies.find(c => c.id === currencyId)?.code || 'N/A';
  }
}
