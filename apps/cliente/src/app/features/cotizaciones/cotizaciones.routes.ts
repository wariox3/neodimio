import { Routes } from '@angular/router';

export const COTIZACIONES_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/cotizacion-list/cotizacion-list.component').then(
        (m) => m.CotizacionListComponent,
      ),
  },
  {
    path: 'nueva',
    loadComponent: () =>
      import('./pages/cotizacion-nueva/cotizacion-nueva.component').then(
        (m) => m.CotizacionNuevaComponent,
      ),
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./pages/cotizacion-detalle/cotizacion-detalle.component').then(
        (m) => m.CotizacionDetalleComponent,
      ),
  },
];
