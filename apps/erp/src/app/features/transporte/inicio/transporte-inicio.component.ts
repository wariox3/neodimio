import { Component } from '@angular/core';
import { PageHeaderComponent } from '@semantica/ui';

/** Página de entrada del módulo Transporte. */
@Component({
  selector: 'app-transporte-inicio',
  standalone: true,
  imports: [PageHeaderComponent],
  template: `
    <div class="page-container">
      <app-page-header title="Transporte" />
    </div>
  `,
})
export class TransporteInicioComponent {}
