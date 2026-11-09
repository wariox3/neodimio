import { Routes } from '@angular/router';

export const GUIA_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/guias-list/guias-list.component').then((m) => m.GuiasListComponent),
  },
];
