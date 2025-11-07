import {
  Configuration,
  LogLevel,
  BrowserCacheLocation,
  InteractionType
} from '@azure/msal-browser';
import {
  MsalGuardConfiguration,
  MsalInterceptorConfiguration
} from '@azure/msal-angular';
import { environment } from '../../../environments/environment';

export const msalConfiguration: Configuration = {
  auth: {
    clientId: environment.msalConfig.auth.clientId,
    authority: environment.msalConfig.auth.authority,
    redirectUri: environment.msalConfig.auth.redirectUri,
    postLogoutRedirectUri: environment.msalConfig.auth.redirectUri + '/login',
    navigateToLoginRequestUrl: true,
  },
  cache: {
    cacheLocation: BrowserCacheLocation.LocalStorage,
    storeAuthStateInCookie: false,
    secureCookies: false,
  },
  system: {
    loggerOptions: {
      loggerCallback: (level: LogLevel, message: string, containsPii: boolean) => {
        if (containsPii) {
          return;
        }
      },
      logLevel: environment.production ? LogLevel.Warning : LogLevel.Info,
      piiLoggingEnabled: false,
    },
    windowHashTimeout: 60000,
    iframeHashTimeout: 6000,
    loadFrameTimeout: 0,
  },
};

export const msalGuardConfig: MsalGuardConfiguration = {
  interactionType: InteractionType.Redirect,
  authRequest: {
    scopes: environment.apiConfig.scopes,
  },
  loginFailedRoute: '/login',
};

export const msalInterceptorConfig: MsalInterceptorConfiguration = {
  interactionType: InteractionType.Redirect,
  protectedResourceMap: new Map<string, Array<string>>([
    [environment.apiConfig.uri, environment.apiConfig.scopes],
  ]),
};

export const AUTH_SCOPES = {
  DEFAULT: environment.apiConfig.scopes,
  USER_READ: ['User.Read'],
  USER_WRITE: ['User.ReadWrite'],
  API_ACCESS: environment.apiConfig.scopes,
} as const;

export const AUTH_TIMEOUTS = {
  TOKEN_REFRESH: 300000,
  LOGIN_REDIRECT: 60000,
  SILENT_TOKEN: 10000,
} as const;

export const PUBLIC_ENDPOINTS = [
  '/login',
  '/health',
  '/public',
] as const;
