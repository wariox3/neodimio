import { Routes } from '@angular/router';
import { activeTenantGuard, authGuard, publicGuard } from './core';

export const routes: Routes = [
  {
    path: '',
    canActivate: [publicGuard],
    loadComponent: () =>
      import('./features/landing/landing.component').then((m) => m.LandingComponent),
    pathMatch: 'full',
  },
  {
    path: 'auth',
    loadChildren: () => import('./features/auth/auth.routes').then((m) => m.AUTH_ROUTES),
  },
  {
    path: 'contenedores',
    canActivate: [authGuard],
    loadChildren: () =>
      import('./features/contenedores/contenedores.routes').then((m) => m.CONTENEDORES_ROUTES),
  },
  {
    path: 'dashboard',
    canActivate: [authGuard, activeTenantGuard],
    loadChildren: () =>
      import('./features/dashboard/dashboard.routes').then((m) => m.DASHBOARD_ROUTES),
  },
  { path: '**', redirectTo: 'auth/login' },
];
