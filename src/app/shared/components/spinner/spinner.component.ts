import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { BlockUIModule } from 'primeng/blockui';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { SpinnerService, SpinnerState } from '../../services/spinner.service';

@Component({
  selector: 'app-spinner',
  standalone: true,
  imports: [CommonModule, BlockUIModule, ProgressSpinnerModule],
  templateUrl: './spinner.component.html',
  styleUrl: './spinner.component.scss'
})
export class SpinnerComponent implements OnInit, OnDestroy {
  spinnerState: SpinnerState = { show: false };
  private subscription: Subscription = new Subscription();

  constructor(private spinnerService: SpinnerService) {}

  ngOnInit(): void {
    this.subscription = this.spinnerService.spinnerState$.subscribe(
      (state: SpinnerState) => {
        this.spinnerState = state;
      }
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
