import { Routes } from '@angular/router';

export const DESTINATARIOS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/destinatario-list/destinatario-list.component').then(
        (m) => m.DestinatarioListComponent,
      ),
  },
  {
    path: 'nuevo',
    loadComponent: () =>
      import('./pages/destinatario-form/destinatario-form.component').then(
        (m) => m.DestinatarioFormComponent,
      ),
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./pages/destinatario-form/destinatario-form.component').then(
        (m) => m.DestinatarioFormComponent,
      ),
  },
];
