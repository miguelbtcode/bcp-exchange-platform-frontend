import { HttpInterceptorFn, HttpErrorResponse, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError, retry, timer } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { PUBLIC_ENDPOINTS } from '../config/auth.config';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);

  if (shouldSkipTokenInjection(req)) {
    return next(req);
  }

  if (!authService.isAuthenticated()) {
    return next(req);
  }

  return authService.getAccessToken().pipe(
    switchMap(result => {
      const authorizedRequest = req.clone({
        setHeaders: {
          Authorization: `Bearer ${result.accessToken}`
        }
      });

      return next(authorizedRequest).pipe(
        retry({
          count: 2,
          delay: (error, retryCount) => {
            if (shouldRetryRequest(error, retryCount)) {
              return timer(retryCount * 1000);
            }
            throw error;
          }
        }),
        catchError(error => handleHttpError(error, req, authService))
      );
    }),
    catchError(tokenError => {
      if (tokenError.code === 'NO_ACCOUNT' || tokenError.code === 'NOT_BROWSER') {
        authService.loginRedirect();
      }

      return throwError(() => tokenError);
    })
  );
};

function shouldSkipTokenInjection(req: HttpRequest<unknown>): boolean {
  if (!req.url.includes('/api/')) {
    return true;
  }

  const isPublicEndpoint = PUBLIC_ENDPOINTS.some(endpoint =>
    req.url.includes(endpoint)
  );

  if (isPublicEndpoint) {
    return true;
  }

  if (req.headers.has('X-Skip-Auth')) {
    return true;
  }

  return false;
}

function shouldRetryRequest(error: unknown, retryCount: number): boolean {
  if (retryCount > 2) {
    return false;
  }

  if (!(error instanceof HttpErrorResponse)) {
    return false;
  }

  if (error.status === 0) {
    return true;
  }

  if (error.status >= 500 && error.status < 600) {
    return true;
  }

  if (error.status === 408) {
    return true;
  }

  if (error.status === 429) {
    return true;
  }

  return false;
}

function handleHttpError(
  error: unknown,
  req: HttpRequest<unknown>,
  authService: AuthService
) {
  if (!(error instanceof HttpErrorResponse)) {
    return throwError(() => error);
  }

  if (error.status === 401) {
    if (authService.isAuthenticated()) {
      authService.loginRedirect();
    }

    return throwError(() => ({
      ...error,
      message: 'Su sesión ha expirado. Por favor, inicie sesión nuevamente.'
    }));
  }

  if (error.status === 403) {
    return throwError(() => ({
      ...error,
      message: 'No tiene permisos para acceder a este recurso.'
    }));
  }

  if (error.status === 0) {
    return throwError(() => ({
      ...error,
      message: 'Error de conexión. Verifique su conexión a internet.'
    }));
  }

  return throwError(() => error);
}
