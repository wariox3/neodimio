import { Routes } from '@angular/router';

export const COTIZACIONES_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/cotizacion-list/cotizacion-list.component').then(
        (m) => m.CotizacionListComponent,
      ),
  },
];
