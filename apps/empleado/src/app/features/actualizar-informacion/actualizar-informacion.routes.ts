import { Routes } from '@angular/router';

export const ACTUALIZAR_INFORMACION_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/actualizar-informacion-page/actualizar-informacion-page.component').then(
        (m) => m.ActualizarInformacionPageComponent,
      ),
  },
];
