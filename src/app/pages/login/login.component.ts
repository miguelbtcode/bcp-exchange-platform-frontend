import { Component, inject, OnInit, OnDestroy, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { Subject, takeUntil } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';
import { AuthStatus } from '../../core/models/auth.model';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ButtonModule, CardModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit, OnDestroy {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);
  private readonly destroy$ = new Subject<void>();

  isLoading = false;
  authError: string | null = null;
  isProcessingRedirect = false;

  ngOnInit(): void {
    if (this.isBrowser) {
      const urlParams = new URLSearchParams(window.location.search);
      const hasAuthParams = urlParams.has('code') || urlParams.has('error') ||
                            urlParams.has('state') || window.location.hash.includes('access_token');

      if (hasAuthParams) {
        this.isProcessingRedirect = true;
        return;
      }
    }

    this.authService.authState$
      .pipe(takeUntil(this.destroy$))
      .subscribe(state => {
        if (state.status === AuthStatus.AUTHENTICATED) {
          this.router.navigate(['/welcome']);
        }

        if (state.status === AuthStatus.ERROR && state.error) {
          this.isLoading = false;
          this.isProcessingRedirect = false;
          this.authError = state.error.message || 'Error al iniciar sesión';
        }

        this.isLoading = state.isLoading;
      });

    this.route.queryParams
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
      });
  }

  login(): void {
    this.authError = null;
    this.isLoading = true;

    try {
      this.authService.loginRedirect({
        scopes: undefined,
      });
    } catch (error) {
      this.authError = 'Error al iniciar el proceso de autenticación';
      this.isLoading = false;
    }
  }

  loginWithPopup(): void {
    this.authError = null;
    this.isLoading = true;

    this.authService.loginPopup()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.isLoading = false;

          const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/welcome';
          this.router.navigate([returnUrl]);
        },
        error: () => {
          this.authError = 'Error al iniciar sesión con popup';
          this.isLoading = false;
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
