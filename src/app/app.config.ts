import Aura from '@primeng/themes/aura';
import { provideToastr } from 'ngx-toastr';
import { provideRouter } from '@angular/router';
import { providePrimeNG } from 'primeng/config';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { ApplicationConfig, provideZoneChangeDetection, APP_INITIALIZER } from '@angular/core';
import { ConfirmationService } from 'primeng/api';
import {
  MSAL_INSTANCE,
  MsalService,
  MsalGuard,
  MsalBroadcastService,
  MSAL_GUARD_CONFIG,
  MSAL_INTERCEPTOR_CONFIG,
} from '@azure/msal-angular';
import {
  IPublicClientApplication,
  PublicClientApplication,
} from '@azure/msal-browser';

import { routes } from './app.routes';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { errorHandlerInterceptor } from './core/interceptors/error-handler.interceptor';
import {
  msalConfiguration,
  msalGuardConfig,
  msalInterceptorConfig
} from './core/config/auth.config';

export function MSALInstanceFactory(): IPublicClientApplication {
  const msalInstance = new PublicClientApplication(msalConfiguration);
  return msalInstance;
}

export function initializeMSAL(msalInstance: IPublicClientApplication) {
  return () => {
    return msalInstance.initialize()
      .then(() => {
      })
      .catch(error => {
        throw error;
      });
  };
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),

    provideHttpClient(
      withFetch(),
      withInterceptors([authInterceptor, errorHandlerInterceptor])
    ),

    provideAnimationsAsync(),

    providePrimeNG({
      theme: {
        preset: Aura,
        options: {
          darkModeSelector: 'none',
          cssLayer: {
            name: 'primeng',
            order: 'theme, base, primeng',
          },
        },
      },
    }),

    provideToastr({
      timeOut: 3000,
      positionClass: 'toast-top-right',
      preventDuplicates: true,
      progressBar: true,
      closeButton: true,
    }),

    ConfirmationService,

    {
      provide: MSAL_INSTANCE,
      useFactory: MSALInstanceFactory
    },
    {
      provide: APP_INITIALIZER,
      useFactory: initializeMSAL,
      deps: [MSAL_INSTANCE],
      multi: true
    },
    {
      provide: MSAL_GUARD_CONFIG,
      useValue: msalGuardConfig
    },
    {
      provide: MSAL_INTERCEPTOR_CONFIG,
      useValue: msalInterceptorConfig
    },

    MsalService,
    MsalGuard,
    MsalBroadcastService,

    provideZoneChangeDetection({ eventCoalescing: true }),
  ],
};
