import { Routes } from '@angular/router';

export const CAPACITACIONES_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./components/capacitaciones-list/capacitaciones-list.component').then(
        (m) => m.CapacitacionesListComponent,
      ),
  },
];
