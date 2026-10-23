import { Routes } from '@angular/router';
import { ShellComponent } from './shell/shell.component';
import { tenantGuard } from '../../core/guards/tenant.guard';

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
        path: 'perfil',
        loadChildren: () => import('../perfil/perfil.routes').then((m) => m.PERFIL_ROUTES),
      },
      {
        path: 'pagos',
        canActivate: [tenantGuard],
        loadChildren: () => import('../pagos/pagos.routes').then((m) => m.PAGOS_ROUTES),
      },
      {
        path: 'reclamos',
        canActivate: [tenantGuard],
        loadChildren: () => import('../reclamos/reclamos.routes').then((m) => m.RECLAMOS_ROUTES),
      },
      {
        path: 'solicitudes',
        canActivate: [tenantGuard],
        loadChildren: () =>
          import('../solicitudes/solicitudes.routes').then((m) => m.SOLICITUDES_ROUTES),
      },
      {
        path: 'capacitaciones',
        canActivate: [tenantGuard],
        loadChildren: () =>
          import('../capacitaciones/capacitaciones.routes').then((m) => m.CAPACITACIONES_ROUTES),
      },
      {
        path: 'certificado-laboral',
        canActivate: [tenantGuard],
        loadChildren: () =>
          import('../certificado-laboral/certificado-laboral.routes').then(
            (m) => m.CERTIFICADO_LABORAL_ROUTES,
          ),
      },
      {
        path: 'turnos',
        canActivate: [tenantGuard],
        loadChildren: () => import('../turnos/turnos.routes').then((m) => m.TURNOS_ROUTES),
      },
      {
        path: 'programaciones',
        canActivate: [tenantGuard],
        loadChildren: () =>
          import('../programaciones/programaciones.routes').then((m) => m.PROGRAMACIONES_ROUTES),
      },
      {
        path: 'reportes-programacion',
        canActivate: [tenantGuard],
        loadChildren: () =>
          import('../reportes-programacion/reportes-programacion.routes').then(
            (m) => m.REPORTES_PROGRAMACION_ROUTES,
          ),
      },
      {
        path: 'actualizar-informacion',
        canActivate: [tenantGuard],
        loadChildren: () =>
          import('../actualizar-informacion/actualizar-informacion.routes').then(
            (m) => m.ACTUALIZAR_INFORMACION_ROUTES,
          ),
      },
      {
        path: 'creditos',
        canActivate: [tenantGuard],
        loadChildren: () => import('../creditos/creditos.routes').then((m) => m.CREDITOS_ROUTES),
      },
      {
        path: 'anticipo-nomina',
        canActivate: [tenantGuard],
        loadChildren: () =>
          import('../anticipo-nomina/anticipo-nomina.routes').then((m) => m.ANTICIPO_NOMINA_ROUTES),
      },
      { path: '', redirectTo: 'inicio', pathMatch: 'full' },
    ],
  },
];
