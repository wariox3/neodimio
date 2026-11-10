import { Routes } from '@angular/router';

export const CONSIGNAS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/consigna-list/consigna-list.component').then((m) => m.ConsignaListComponent),
  },
];
