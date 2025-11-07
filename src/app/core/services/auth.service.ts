import { Injectable, inject, PLATFORM_ID, OnDestroy } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { MsalService, MsalBroadcastService } from '@azure/msal-angular';
import {
  AuthenticationResult,
  InteractionStatus,
  PopupRequest,
  RedirectRequest,
  SilentRequest,
  AccountInfo,
  InteractionRequiredAuthError
} from '@azure/msal-browser';
import {
  filter,
  Observable,
  BehaviorSubject,
  Subject,
  takeUntil,
  map,
  catchError,
  throwError,
  from,
  of,
  tap,
  retry
} from 'rxjs';
import {
  AuthenticatedUser,
  AuthState,
  AuthStatus,
  LoginOptions,
  LogoutOptions,
  AuthError
} from '../models/auth.model';
import { AUTH_SCOPES } from '../config/auth.config';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService implements OnDestroy {
  private readonly msalService = inject(MsalService);
  private readonly msalBroadcastService = inject(MsalBroadcastService);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);

  private readonly authStateSubject = new BehaviorSubject<AuthState>({
    status: AuthStatus.INITIALIZING,
    user: null,
    error: null,
    isLoading: true
  });

  public readonly authState$ = this.authStateSubject.asObservable();

  public readonly isAuthenticated$ = this.authState$.pipe(
    map(state => state.status === AuthStatus.AUTHENTICATED)
  );

  public readonly currentUser$ = this.authState$.pipe(
    map(state => state.user)
  );

  public readonly isLoading$ = this.authState$.pipe(
    map(state => state.isLoading)
  );

  private readonly destroy$ = new Subject<void>();

  constructor() {
    this.initializeAuthState();
  }

  private initializeAuthState(): void {
    if (!this.isBrowser) {
      this.updateAuthState(AuthStatus.UNAUTHENTICATED, null, null, false);
      return;
    }

    this.msalBroadcastService.inProgress$
      .pipe(
        filter((status: InteractionStatus) => status === InteractionStatus.None),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        this.checkAndUpdateAuthState();
      });

    this.checkAndUpdateAuthState();
  }

  private checkAndUpdateAuthState(): void {
    const accounts = this.msalService.instance.getAllAccounts();

    if (accounts.length > 0) {
      const user = this.mapAccountToUser(accounts[0]);
      this.updateAuthState(AuthStatus.AUTHENTICATED, user, null, false);
    } else {
      this.updateAuthState(AuthStatus.UNAUTHENTICATED, null, null, false);
    }
  }

  private updateAuthState(
    status: AuthStatus,
    user: AuthenticatedUser | null,
    error: AuthError | null,
    isLoading: boolean
  ): void {
    this.authStateSubject.next({ status, user, error, isLoading });
  }

  private mapAccountToUser(account: AccountInfo): AuthenticatedUser {
    return {
      email: account.username,
      name: account.name || account.username,
      username: account.username,
      roles: account.idTokenClaims?.roles as string[] || [],
      account
    };
  }

  private createAuthError(error: unknown): AuthError {
    const err = error as { errorCode?: string; errorMessage?: string; message?: string; subError?: string };
    return {
      code: err.errorCode || 'UNKNOWN_ERROR',
      message: err.errorMessage || err.message || 'Error desconocido',
      details: err.subError || '',
      timestamp: new Date()
    };
  }

  public loginPopup(options?: LoginOptions): Observable<AuthenticationResult> {
    if (!this.isBrowser) {
      return throwError(() => this.createAuthError({
        errorCode: 'NOT_BROWSER',
        errorMessage: 'La autenticación solo está disponible en el navegador'
      }));
    }

    this.updateAuthState(
      this.authStateSubject.value.status,
      this.authStateSubject.value.user,
      null,
      true
    );

    const loginRequest: PopupRequest = {
      scopes: options?.scopes || AUTH_SCOPES.DEFAULT,
      prompt: options?.prompt,
      loginHint: options?.loginHint
    };

    return from(this.msalService.loginPopup(loginRequest)).pipe(
      tap(result => {
        if (result?.account) {
          const user = this.mapAccountToUser(result.account);
          this.updateAuthState(AuthStatus.AUTHENTICATED, user, null, false);
        }
      }),
      catchError(error => {
        const authError = this.createAuthError(error);
        this.updateAuthState(AuthStatus.ERROR, null, authError, false);
        return throwError(() => authError);
      })
    );
  }

  public loginRedirect(options?: LoginOptions): void {
    if (!this.isBrowser) {
      return;
    }

    this.updateAuthState(
      this.authStateSubject.value.status,
      this.authStateSubject.value.user,
      null,
      true
    );

    const loginRequest: RedirectRequest = {
      scopes: options?.scopes || AUTH_SCOPES.DEFAULT,
      prompt: options?.prompt,
      loginHint: options?.loginHint
    };

    this.msalService.loginRedirect(loginRequest);
  }

  public logout(options?: LogoutOptions): void {
    if (!this.isBrowser) {
      return;
    }

    const account = this.msalService.instance.getAllAccounts()[0];
    if (!account) {
      return;
    }

    const logoutRequest = {
      account,
      postLogoutRedirectUri: options?.postLogoutRedirectUri ||
        environment.msalConfig.auth.redirectUri + '/login',
      mainWindowRedirectUri: options?.mainWindowRedirectUri
    };

    this.updateAuthState(AuthStatus.UNAUTHENTICATED, null, null, false);
    this.msalService.logoutRedirect(logoutRequest);
  }

  public getAccessToken(scopes?: string[]): Observable<AuthenticationResult> {
    if (!this.isBrowser) {
      return throwError(() => this.createAuthError({
        errorCode: 'NOT_BROWSER',
        errorMessage: 'Token solo disponible en navegador'
      }));
    }

    const accounts = this.msalService.instance.getAllAccounts();
    if (accounts.length === 0) {
      return throwError(() => this.createAuthError({
        errorCode: 'NO_ACCOUNT',
        errorMessage: 'No hay usuario autenticado'
      }));
    }

    const request: SilentRequest = {
      scopes: scopes || AUTH_SCOPES.DEFAULT,
      account: accounts[0],
      forceRefresh: false
    };

    return from(this.msalService.acquireTokenSilent(request)).pipe(
      retry({
        count: 2,
        delay: 1000,
        resetOnSuccess: true
      }),
      catchError(error => {
        if (error instanceof InteractionRequiredAuthError) {
          this.loginRedirect({ scopes: request.scopes as string[] });
        }

        return throwError(() => this.createAuthError(error));
      })
    );
  }

  public isAuthenticated(): boolean {
    if (!this.isBrowser) {
      return false;
    }
    return this.msalService.instance.getAllAccounts().length > 0;
  }

  public getCurrentUser(): AuthenticatedUser | null {
    if (!this.isBrowser) {
      return null;
    }

    const accounts = this.msalService.instance.getAllAccounts();
    if (accounts.length === 0) {
      return null;
    }

    return this.mapAccountToUser(accounts[0]);
  }

  public getUserEmail(): string | null {
    const user = this.getCurrentUser();
    return user?.email || null;
  }

  public getUserName(): string | null {
    const user = this.getCurrentUser();
    return user?.name || null;
  }

  public hasRole(role: string): boolean {
    const user = this.getCurrentUser();
    return user?.roles?.includes(role) || false;
  }

  public hasAnyRole(roles: string[]): boolean {
    const user = this.getCurrentUser();
    if (!user?.roles) {
      return false;
    }
    return roles.some(role => user.roles!.includes(role));
  }

  public canEdit(): boolean {
    const user = this.getCurrentUser();
    if (!user?.roles) {
      return false;
    }
    return !user.roles.includes('Viewer');
  }

  public handleRedirectObservable(): Observable<AuthenticationResult | null> {
    if (!this.isBrowser) {
      return of(null);
    }

    return from(this.msalService.instance.handleRedirectPromise()).pipe(
      tap(result => {
        if (result?.account) {
          const user = this.mapAccountToUser(result.account);
          this.updateAuthState(AuthStatus.AUTHENTICATED, user, null, false);
        } else {
          this.checkAndUpdateAuthState();
        }
      }),
      catchError(error => {
        const authError = this.createAuthError(error);
        this.updateAuthState(AuthStatus.ERROR, null, authError, false);
        return of(null);
      })
    );
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.authStateSubject.complete();
  }
}
