import { Routes } from '@angular/router';

export const INVITACIONES_ROUTES: Routes = [
  {
    path: '',
    redirectTo: 'lista',
    pathMatch: 'full',
  },
  {
    path: 'lista',
    loadComponent: () =>
      import('./pages/invitacion-list/invitacion-list.component').then(
        (m) => m.InvitacionListComponent,
      ),
  },
];
