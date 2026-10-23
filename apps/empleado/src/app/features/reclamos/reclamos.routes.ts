import { Routes } from '@angular/router';

export const RECLAMOS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/reclamos-list/reclamos-list.component').then((m) => m.ReclamosListComponent),
  },
];
