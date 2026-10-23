import { Routes } from '@angular/router';

export const PERFIL_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/perfil-page/perfil-page.component').then((m) => m.PerfilPageComponent),
  },
];
