import { Routes } from '@angular/router';

export const REPORTES_PROGRAMACION_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/reportes-programacion-list/reportes-programacion-list.component').then(
        (m) => m.ReportesProgramacionListComponent,
      ),
  },
];
