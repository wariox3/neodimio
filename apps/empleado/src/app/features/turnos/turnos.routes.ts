import { Routes } from '@angular/router';

export const TURNOS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/turnos-list/turnos-list.component').then((m) => m.TurnosListComponent),
  },
];
