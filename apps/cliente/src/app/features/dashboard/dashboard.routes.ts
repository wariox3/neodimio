import { Route, Routes } from '@angular/router';
import { ShellComponent } from './shell/shell.component';

/** Ruta provisional de un módulo pendiente de migrar desde terbio. */
const enConstruccion = (path: string, title: string): Route => ({
  path,
  data: { title },
  loadComponent: () =>
    import('./en-construccion/en-construccion.component').then((m) => m.EnConstruccionComponent),
});

export const DASHBOARD_ROUTES: Routes = [
  {
    path: '',
    component: ShellComponent,
    children: [
      {
        path: 'inicio',
        loadComponent: () => import('./inicio/inicio.component').then((m) => m.InicioComponent),
      },
      {
        path: 'general',
        children: [enConstruccion('informacion', 'Información')],
      },
      {
        path: 'crm',
        children: [
          enConstruccion('visitas', 'Visita'),
          enConstruccion('cotizaciones', 'Cotización'),
          enConstruccion('pqrs', 'PQRS'),
        ],
      },
      {
        path: 'operacion',
        children: [enConstruccion('consignas', 'Consigna')],
      },
      {
        path: 'programacion',
        children: [enConstruccion('empleados', 'Programación de empleados')],
      },
      {
        path: 'venta',
        children: [enConstruccion('facturas', 'Facturas')],
      },
      {
        path: 'cartera',
        children: [
          enConstruccion('pendientes', 'Cartera pendiente'),
          enConstruccion('recibos', 'Recibos'),
        ],
      },
      {
        path: 'recurso-humano',
        children: [
          enConstruccion('autorizacion-arma', 'Autorización arma'),
          enConstruccion('seguridad-social', 'Seguridad social'),
        ],
      },
      {
        path: 'transporte',
        children: [
          {
            path: 'guias',
            loadChildren: () => import('../guias/guias.routes').then((m) => m.GUIAS_ROUTES),
          },
          {
            path: 'novedades',
            loadComponent: () =>
              import('../novedades/pages/novedad-list/novedad-list.component').then(
                (m) => m.NovedadListComponent,
              ),
          },
          {
            path: 'destinatarios',
            loadChildren: () =>
              import('../destinatarios/destinatarios.routes').then((m) => m.DESTINATARIOS_ROUTES),
          },
        ],
      },
      {
        path: 'gestion-logistica',
        children: [
          {
            path: 'despachos',
            loadComponent: () =>
              import('../despachos/pages/despacho-list/despacho-list.component').then(
                (m) => m.DespachoListComponent,
              ),
          },
          enConstruccion('soporte', 'Soporte'),
          enConstruccion('redespacho', 'Redespacho'),
        ],
      },
      { path: '', redirectTo: 'inicio', pathMatch: 'full' },
    ],
  },
];
