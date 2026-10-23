import { Routes } from '@angular/router';

export const FORMATO_ROUTES: Routes = [
  {
    path: '',
    redirectTo: 'lista',
    pathMatch: 'full',
  },
  {
    path: 'lista',
    loadComponent: () =>
      import('./pages/formato-list/formato-list.component').then((m) => m.FormatoListComponent),
  },
  {
    path: 'editar/:id',
    loadComponent: () =>
      import('./pages/formato-edit/formato-edit.component').then((m) => m.FormatoEditComponent),
  },
];
