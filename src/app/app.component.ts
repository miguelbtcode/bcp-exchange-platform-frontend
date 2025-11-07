import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { filter, Subject, takeUntil } from 'rxjs';
import { SidebarComponent } from './shared/components/sidebar.component';
import { SpinnerComponent } from './shared/components/spinner/spinner.component';
import { SidebarService } from './shared/services/sidebar.service';
import { AuthService } from './core/services/auth.service';
import { AuthStatus, AuthState } from './core/models/auth.model';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, SidebarComponent, SpinnerComponent, CommonModule],
  templateUrl: './app.component.html'
})
export class AppComponent implements OnInit, OnDestroy {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  public readonly sidebarService = inject(SidebarService);

  authState: AuthState = {
    status: AuthStatus.INITIALIZING,
    user: null,
    error: null,
    isLoading: true
  };

  isProcessingAuth = true;

  private readonly destroy$ = new Subject<void>();

  title = 'BcpExchangeRate';

  ngOnInit(): void {
    this.authService.authState$
      .pipe(takeUntil(this.destroy$))
      .subscribe(state => {
        this.authState = state;
      });

    this.authService.handleRedirectObservable()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result) => {
          if (result?.account) {
            this.router.navigate(['/welcome']).then(() => {
              this.isProcessingAuth = false;
            });
          } else {
            if (this.authService.isAuthenticated()) {
              const currentUrl = this.router.url;

              if (currentUrl === '/' || currentUrl === '/login') {
                this.router.navigate(['/welcome']).then(() => {
                  this.isProcessingAuth = false;
                });
              } else {
                this.isProcessingAuth = false;
              }
            } else {
              this.isProcessingAuth = false;
            }
          }
        },
        error: () => {
          this.isProcessingAuth = false;
        }
      });

    this.router.events
      .pipe(
        filter(event => event instanceof NavigationEnd),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
      });
  }

  retryAuthentication(): void {
    window.location.reload();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
