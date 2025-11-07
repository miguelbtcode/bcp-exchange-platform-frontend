import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { ToastrService } from 'ngx-toastr';

interface ProblemDetails {
  title: string;
  status: number;
  detail?: string;
  instance?: string;
  traceId?: string;
  errors?: Record<string, string[]>;
}

export const errorHandlerInterceptor: HttpInterceptorFn = (req, next) => {
  const toastr = inject(ToastrService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.error && isProblemDetails(error.error)) {
        handleProblemDetails(error.error, toastr);
      } else {
        handleGenericError(error, toastr);
      }

      return throwError(() => error);
    })
  );
};

function isProblemDetails(error: unknown): error is ProblemDetails {
  return (
    typeof error === 'object' &&
    error !== null &&
    'title' in error &&
    'status' in error
  );
}

function handleProblemDetails(problem: ProblemDetails, toastr: ToastrService): void {
  const status = problem.status;
  const title = problem.title;
  const message = problem.detail || 'Ha ocurrido un error';

  if (status >= 500) {
    toastr.error(message, title, {
      timeOut: 5000,
      progressBar: true,
      closeButton: true
    });
  } else if (status === 400 || status === 409) {
    toastr.warning(message, title, {
      timeOut: 4000,
      progressBar: true,
      closeButton: true
    });
  } else if (status === 404) {
    toastr.info('El recurso solicitado no existe', title, {
      timeOut: 4000,
      progressBar: true
    });
  } else if (status === 401 || status === 403) {
    toastr.error('No tienes permisos para realizar esta acción', title, {
      timeOut: 4000,
      progressBar: true
    });
  } else {
    toastr.warning(message, title, {
      timeOut: 4000,
      progressBar: true
    });
  }

  if (problem.errors) {
    const errorMessages = Object.entries(problem.errors)
      .flatMap(([field, messages]) =>
        messages.map(msg => `${field}: ${msg}`)
      )
      .join('\n');

    if (errorMessages) {
      toastr.warning(errorMessages, 'Errores de validación', {
        timeOut: 5000,
        progressBar: true,
        closeButton: true,
        enableHtml: true
      });
    }
  }
}

function handleGenericError(error: HttpErrorResponse, toastr: ToastrService): void {
  if (error.status === 0) {
    toastr.error(
      'No se pudo conectar con el servidor. Verifica tu conexión a internet.',
      'Error de conexión',
      { timeOut: 5000, progressBar: true, closeButton: true }
    );
  } else if (error.status >= 500) {
    toastr.error(
      'Ha ocurrido un error en el servidor. Por favor, intenta más tarde.',
      'Error del servidor',
      { timeOut: 5000, progressBar: true, closeButton: true }
    );
  } else if (error.status === 401) {
    toastr.error(
      'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.',
      'No autorizado',
      { timeOut: 4000, progressBar: true }
    );
  } else if (error.status === 403) {
    toastr.error(
      'No tienes permisos para acceder a este recurso.',
      'Acceso denegado',
      { timeOut: 4000, progressBar: true }
    );
  } else if (error.status === 404) {
    toastr.info(
      'El recurso solicitado no fue encontrado.',
      'No encontrado',
      { timeOut: 4000, progressBar: true }
    );
  }
}
