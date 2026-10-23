import { Routes } from '@angular/router';

export const PROGRAMACIONES_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/programaciones-list/programaciones-list.component').then(
        (m) => m.ProgramacionesListComponent,
      ),
  },
];
