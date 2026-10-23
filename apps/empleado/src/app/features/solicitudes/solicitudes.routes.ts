import { Routes } from '@angular/router';

export const SOLICITUDES_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/solicitudes-list/solicitudes-list.component').then(
        (m) => m.SolicitudesListComponent,
      ),
  },
];
