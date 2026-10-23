import { Component, inject } from '@angular/core';
import { PageHeaderComponent } from '@semantica/ui';
import { ActiveTenantService } from '../../../core';

@Component({
  selector: 'app-inicio',
  standalone: true,
  imports: [PageHeaderComponent],
  templateUrl: './inicio.component.html',
})
export class InicioComponent {
  readonly activeTenant = inject(ActiveTenantService).tenant;
}
