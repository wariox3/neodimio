import { Routes } from '@angular/router';

export const VISITAS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/visita-list/visita-list.component').then((m) => m.VisitaListComponent),
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./pages/visita-detalle/visita-detalle.component').then(
        (m) => m.VisitaDetalleComponent,
      ),
  },
];
