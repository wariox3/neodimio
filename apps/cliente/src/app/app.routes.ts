import { Routes } from '@angular/router';
import { activeTenantGuard, authGuard } from './core';
import { membresiaClienteGuard } from './features/contenedores/guards/membresia-cliente.guard';

export const routes: Routes = [
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
    canActivate: [authGuard, activeTenantGuard, membresiaClienteGuard],
    loadChildren: () =>
      import('./features/dashboard/dashboard.routes').then((m) => m.DASHBOARD_ROUTES),
  },
  { path: '', redirectTo: 'auth/login', pathMatch: 'full' },
  { path: '**', redirectTo: 'auth/login' },
];
