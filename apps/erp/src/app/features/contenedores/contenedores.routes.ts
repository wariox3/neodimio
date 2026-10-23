import { Routes } from '@angular/router';

export const CONTENEDORES_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/contenedor-list/contenedor-list.component').then(
        (m) => m.ContenedorListComponent,
      ),
  },
];
