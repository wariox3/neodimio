import { Component } from '@angular/core';
import { EmptyStateComponent, PageHeaderComponent } from '@semantica/ui';

/** Administrador de guías. Por ahora solo reserva la pantalla dentro del módulo. */
@Component({
  selector: 'app-guias-list',
  standalone: true,
  imports: [EmptyStateComponent, PageHeaderComponent],
  templateUrl: './guias-list.component.html',
})
export class GuiasListComponent {}
