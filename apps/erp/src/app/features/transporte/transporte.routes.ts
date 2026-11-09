import { Routes } from '@angular/router';

/** Rutas del módulo Transporte: delega cada administrador en sus propias rutas. */
export const TRANSPORTE_ROUTES: Routes = [
  { path: '', redirectTo: 'inicio', pathMatch: 'full' },
  {
    path: 'inicio',
    loadComponent: () =>
      import('./inicio/transporte-inicio.component').then((m) => m.TransporteInicioComponent),
  },
  {
    path: 'guias',
    loadChildren: () => import('./masters/guia/guia.routes').then((m) => m.GUIA_ROUTES),
  },
];
