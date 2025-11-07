import { AccountInfo } from '@azure/msal-browser';

export interface AuthenticatedUser {
  email: string;
  name: string;
  username: string;
  roles?: string[];
  account: AccountInfo;
}

export interface AuthResult {
  success: boolean;
  user?: AuthenticatedUser;
  accessToken?: string;
  error?: AuthError;
}

export interface AuthError {
  code: string;
  message: string;
  details?: string;
  timestamp: Date;
}

export enum AuthStatus {
  AUTHENTICATED = 'authenticated',
  UNAUTHENTICATED = 'unauthenticated',
  INITIALIZING = 'initializing',
  ERROR = 'error'
}

export interface AuthState {
  status: AuthStatus;
  user: AuthenticatedUser | null;
  error: AuthError | null;
  isLoading: boolean;
}

export interface LoginOptions {
  scopes?: string[];
  prompt?: 'login' | 'none' | 'consent' | 'select_account';
  loginHint?: string;
}

export interface LogoutOptions {
  postLogoutRedirectUri?: string;
  mainWindowRedirectUri?: string;
}
