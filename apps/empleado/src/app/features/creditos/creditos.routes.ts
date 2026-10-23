import { Routes } from '@angular/router';

export const CREDITOS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/creditos-list/creditos-list.component').then((m) => m.CreditosListComponent),
  },
];
