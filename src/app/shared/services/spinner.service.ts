import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface SpinnerState {
  show: boolean;
  message?: string;
}

@Injectable({
  providedIn: 'root'
})
export class SpinnerService {
  private spinnerSubject = new BehaviorSubject<SpinnerState>({ show: false });
  public spinnerState$: Observable<SpinnerState> = this.spinnerSubject.asObservable();

  constructor() { }

  show(message?: string): void {
    this.spinnerSubject.next({ show: true, message });
  }

  hide(): void {
    this.spinnerSubject.next({ show: false });
  }

  get currentState(): SpinnerState {
    return this.spinnerSubject.value;
  }
}
