import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/**
 * Tarjeta de una página de detalle: barra de título (ícono + nombre + acciones a la derecha) y
 * contenido proyectado. El padding del cuerpo lo define quien la usa, porque una ficha en grupos
 * llega con sus propios filetes hasta el borde.
 */
@Component({
  selector: 'app-detail-section',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="detail-section">
      <header class="detail-section__bar">
        <span class="detail-section__icon" aria-hidden="true"><i [class]="icon()"></i></span>
        <h2 class="detail-section__title">{{ title() }}</h2>
        <div class="detail-section__actions">
          <ng-content select="[sectionActions]" />
        </div>
      </header>
      <ng-content />
    </section>
  `,
  styles: `
    .detail-section {
      overflow: hidden;
      border: 1px solid var(--p-content-border-color);
      border-radius: 12px;
      background: var(--p-surface-0);

      &__bar {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 0.5rem 0.75rem;
        padding: 0.875rem 1.25rem;
        border-bottom: 1px solid var(--p-content-border-color);
      }

      &__icon {
        display: grid;
        flex-shrink: 0;
        place-items: center;
        width: 2.25rem;
        height: 2.25rem;
        border-radius: 10px;
        background: color-mix(in srgb, var(--brand-accent) 10%, var(--p-surface-0));
        color: var(--brand-accent);

        i {
          font-size: 1rem;
        }
      }

      &__title {
        margin: 0;
        font-size: 0.9rem;
        font-weight: 700;
        letter-spacing: -0.01em;
        color: var(--p-text-color);
      }

      &__actions {
        display: flex;
        align-items: center;
        margin-left: auto;
      }
    }
  `,
})
export class DetailSectionComponent {
  /** Clase del PrimeIcon (ej. `'pi pi-map'`). */
  readonly icon = input.required<string>();
  readonly title = input.required<string>();
}
