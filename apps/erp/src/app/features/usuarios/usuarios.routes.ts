import { Routes } from '@angular/router';

export const USUARIOS_ROUTES: Routes = [
  {
    path: '',
    redirectTo: 'lista',
    pathMatch: 'full',
  },
  {
    path: 'lista',
    loadComponent: () =>
      import('./pages/usuario-list/usuario-list.component').then((m) => m.UsuarioListComponent),
  },
];
