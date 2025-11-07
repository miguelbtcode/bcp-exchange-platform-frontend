import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/login',
    pathMatch: 'full',
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./pages/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: 'welcome',
    loadComponent: () =>
      import('./features/welcome/welcome.component').then((m) => m.WelcomeComponent),
    canActivate: [authGuard],
  },
  {
    path: 'exchange-rates',
    loadComponent: () =>
      import('./features/exchange-rates/exchange-rates.component').then((m) => m.ExchangeRatesComponent),
    canActivate: [authGuard],
  },
  {
    path: 'configuration',
    loadComponent: () =>
      import('./features/configuration/configuration.component').then((m) => m.ConfigurationComponent),
    canActivate: [authGuard],
  },
  {
    path: 'parameters',
    loadComponent: () =>
      import('./features/parameters/parameters.component').then((m) => m.ParametersComponent),
    canActivate: [authGuard],
  },
  {
    path: 'dashboard',
    redirectTo: '/welcome',
    pathMatch: 'full',
  },
  {
    path: '**',
    redirectTo: '/login',
  },
];
