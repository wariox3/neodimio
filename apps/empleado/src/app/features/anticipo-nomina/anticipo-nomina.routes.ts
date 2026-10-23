import { Routes } from '@angular/router';

export const ANTICIPO_NOMINA_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/anticipo-nomina-list/anticipo-nomina-list.component').then(
        (m) => m.AnticipoNominaListComponent,
      ),
  },
];
