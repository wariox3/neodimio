import { Routes } from '@angular/router';

export const SEGURIDAD_ROUTES: Routes = [
  {
    path: '',
    redirectTo: 'api-keys',
    pathMatch: 'full',
  },
  {
    path: 'api-keys',
    loadComponent: () => import('./api-keys/api-keys.component').then((m) => m.ApiKeysComponent),
  },
];
