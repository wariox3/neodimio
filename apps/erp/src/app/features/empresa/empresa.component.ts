import { Component, inject } from '@angular/core';
import { ActiveTenantService } from '../../core';
import { EmptyStateComponent, PageHeaderComponent } from '../../shared';

/** Mi empresa: por ahora solo el encabezado, el contenido llegará después. */
@Component({
  selector: 'app-empresa',
  standalone: true,
  imports: [PageHeaderComponent, EmptyStateComponent],
  template: `
    <div class="page-container">
      <app-page-header
        title="Mi empresa"
        icon="pi pi-building"
        [subtitle]="activeTenant()?.nombre ?? ''"
      />
      <app-empty-state
        icon="pi pi-building"
        title="Próximamente"
        message="Aquí podrás consultar y administrar los datos de tu empresa."
      />
    </div>
  `,
})
export class EmpresaComponent {
  readonly activeTenant = inject(ActiveTenantService).tenant;
}
