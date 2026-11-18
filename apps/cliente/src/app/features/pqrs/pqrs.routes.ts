import { Routes } from '@angular/router';

export const PQRS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/pqrs-list/pqrs-list.component').then((m) => m.PqrsListComponent),
  },
  {
    path: 'nueva',
    loadComponent: () =>
      import('./pages/pqrs-nueva/pqrs-nueva.component').then((m) => m.PqrsNuevaComponent),
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./pages/pqrs-detalle/pqrs-detalle.component').then((m) => m.PqrsDetalleComponent),
  },
];
