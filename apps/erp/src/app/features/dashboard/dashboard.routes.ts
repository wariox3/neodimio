import { Routes } from '@angular/router';
import { ShellComponent } from './shell/shell.component';
import { authGuard, propietarioGuard } from '../../core';
import { DashboardArea } from './shell/dashboard-areas';

/**
 * Cada área (`data.area`) define qué menú lateral pinta el shell; ver
 * `dashboard-areas.ts`.
 */
export const DASHBOARD_ROUTES: Routes = [
  {
    path: '',
    component: ShellComponent,
    children: [
      {
        path: 'inicio',
        data: { area: 'inicio' satisfies DashboardArea },
        loadComponent: () => import('./inicio/inicio.component').then((m) => m.InicioComponent),
      },
      {
        path: 'empresa',
        canActivate: [propietarioGuard],
        data: { area: 'empresa' satisfies DashboardArea },
        loadComponent: () => import('../empresa/empresa.component').then((m) => m.EmpresaComponent),
      },
      {
        path: 'seguridad',
        canActivate: [propietarioGuard],
        data: { area: 'seguridad' satisfies DashboardArea },
        children: [
          {
            path: 'usuarios',
            canActivate: [authGuard],
            loadChildren: () =>
              import('../usuarios/usuarios.routes').then((m) => m.USUARIOS_ROUTES),
          },
          {
            path: '',
            loadChildren: () =>
              import('../seguridad/seguridad.routes').then((m) => m.SEGURIDAD_ROUTES),
          },
        ],
      },
      {
        path: 'configuracion',
        canActivate: [propietarioGuard],
        data: { area: 'configuracion' satisfies DashboardArea },
        children: [
          { path: '', redirectTo: 'formato', pathMatch: 'full' },
          {
            path: 'formato',
            loadChildren: () => import('../formato/formato.routes').then((m) => m.FORMATO_ROUTES),
          },
        ],
      },
      { path: '', redirectTo: 'inicio', pathMatch: 'full' },
    ],
  },
];
