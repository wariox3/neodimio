import { Routes } from '@angular/router';

export const GUIAS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/guia-list/guia-list.component').then((m) => m.GuiaListComponent),
  },
  {
    path: 'nueva',
    loadComponent: () =>
      import('./pages/guia-nueva/guia-nueva.component').then((m) => m.GuiaNuevaComponent),
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./pages/guia-detalle/guia-detalle.component').then((m) => m.GuiaDetalleComponent),
  },
];
