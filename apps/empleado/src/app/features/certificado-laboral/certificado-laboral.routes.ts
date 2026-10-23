import { Routes } from '@angular/router';

export const CERTIFICADO_LABORAL_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./components/certificado-laboral-list/certificado-laboral-list.component').then(
        (m) => m.CertificadoLaboralListComponent,
      ),
  },
];
