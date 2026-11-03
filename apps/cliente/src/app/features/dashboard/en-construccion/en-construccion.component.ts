import { Component, input } from '@angular/core';
import { EmptyStateComponent, PageHeaderComponent } from '../../../shared';

/**
 * Página provisional para los módulos que aún no se migran desde terbio.
 * Recibe el título desde `data.title` de la ruta (component input binding).
 */
@Component({
  selector: 'app-en-construccion',
  standalone: true,
  imports: [PageHeaderComponent, EmptyStateComponent],
  template: `
    <div class="page-container">
      <app-page-header [title]="title()" />
      <app-empty-state
        icon="pi pi-wrench"
        title="Módulo en construcción"
        message="Esta sección estará disponible próximamente."
      />
    </div>
  `,
})
export class EnConstruccionComponent {
  readonly title = input.required<string>();
}
