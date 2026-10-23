import { Routes } from '@angular/router';
import { ShellComponent } from './shell/shell.component';
import { authGuard, roleGuard } from '../../core';

export const DASHBOARD_ROUTES: Routes = [
  {
    path: '',
    component: ShellComponent,
    children: [
      {
        path: 'inicio',
        loadComponent: () =>
          import('./inicio/inicio.component').then((m) => m.InicioComponent),
      },
      {
        path: 'seguridad',
        loadChildren: () => import('../seguridad/seguridad.routes').then((m) => m.SEGURIDAD_ROUTES),
      },
      {
        path: 'usuarios',
        canActivate: [authGuard, roleGuard],
        data: { roles: ['admin'] },
        loadChildren: () => import('../usuarios/usuarios.routes').then((m) => m.USUARIOS_ROUTES),
      },
      {
        path: 'formato',
        loadChildren: () => import('../formato/formato.routes').then((m) => m.FORMATO_ROUTES),
      },
      { path: '', redirectTo: 'inicio', pathMatch: 'full' },
    ],
  },
];
