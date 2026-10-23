import { Routes } from '@angular/router';
import { clearActiveTenantGuard } from '../../core';

export const CONTENEDORES_ROUTES: Routes = [
  {
    path: '',
    canActivate: [clearActiveTenantGuard],
    loadComponent: () =>
      import('./pages/contenedor-list/contenedor-list.component').then(
        (m) => m.ContenedorListComponent,
      ),
  },
];
