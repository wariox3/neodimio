import { Routes } from '@angular/router';

// La ruta por defecto del área de seguridad (Usuarios) se define en `dashboard.routes.ts`.
export const SEGURIDAD_ROUTES: Routes = [
  {
    path: 'api-keys',
    loadComponent: () => import('./api-keys/api-keys.component').then((m) => m.ApiKeysComponent),
  },
];
