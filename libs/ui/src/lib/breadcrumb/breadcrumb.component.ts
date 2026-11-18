import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  input,
  signal,
} from '@angular/core';
import { RouterLink } from '@angular/router';

/** Migaja del breadcrumb. El último ítem es la página actual y normalmente no lleva enlace. */
export interface BreadcrumbItem {
  readonly label: string;
  readonly routerLink?: string | unknown[];
}

/** Tiempo que el botón de copiar muestra la confirmación. */
const COPIADO_MS = 1500;

/**
 * Ruta de la página actual: migajas navegables y un botón para copiar el enlace.
 * No conoce el router ni el dominio: quien lo usa arma los `items`.
 *
 * ```html
 * <app-breadcrumb [items]="breadcrumbItems" />
 * ```
 */
@Component({
  selector: 'app-breadcrumb',
  standalone: true,
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="breadcrumb">
      <nav class="breadcrumb__trail" aria-label="Ruta de navegación">
        @for (item of items(); track $index; let last = $last) {
          @if (item.routerLink && !last) {
            <a class="breadcrumb__link" [routerLink]="item.routerLink">{{ item.label }}</a>
          } @else {
            <span
              [class.breadcrumb__current]="last"
              [class.breadcrumb__text]="!last"
              [attr.aria-current]="last ? 'page' : null"
              >{{ item.label }}</span
            >
          }
          @if (!last) {
            <i class="pi pi-angle-right breadcrumb__separator" aria-hidden="true"></i>
          }
        }
      </nav>

      <button
        type="button"
        class="breadcrumb__copy"
        [class.breadcrumb__copy--done]="copied()"
        title="Copiar enlace"
        aria-label="Copiar enlace de esta página"
        (click)="copyLink()"
      >
        <i class="pi" [class.pi-copy]="!copied()" [class.pi-check]="copied()"></i>
      </button>
    </div>
  `,
  styles: `
    .breadcrumb {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      min-height: 1.5rem;
      margin-bottom: 0.75rem;

      &__trail {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 0.125rem 0.375rem;
        min-width: 0;
        font-size: 0.8rem;
      }

      &__link,
      &__text {
        color: var(--p-text-muted-color);
      }

      &__link {
        text-decoration: none;
        transition: color 0.15s ease;

        &:hover {
          color: var(--p-text-color);
        }
      }

      &__current {
        font-weight: 500;
        color: var(--p-text-color);
      }

      &__separator {
        font-size: 0.6rem;
        color: var(--p-text-muted-color);
        opacity: 0.6;
      }

      &__copy {
        display: inline-flex;
        flex-shrink: 0;
        align-items: center;
        justify-content: center;
        width: 1.5rem;
        height: 1.5rem;
        padding: 0;
        border: 0;
        border-radius: 6px;
        background: transparent;
        color: var(--p-text-muted-color);
        cursor: pointer;
        transition:
          background 0.15s ease,
          color 0.15s ease;

        i {
          font-size: 0.75rem;
        }

        &:hover {
          background: var(--nav-hover-background);
          color: var(--p-text-color);
        }

        &:focus-visible {
          outline: 2px solid color-mix(in srgb, var(--brand-accent) 50%, transparent);
          outline-offset: 1px;
        }

        &--done {
          color: var(--p-green-600);
        }

        @media (pointer: coarse) {
          width: 2rem;
          height: 2rem;
        }
      }
    }
  `,
})
export class BreadcrumbComponent {
  /** Migajas en orden; la última es la página actual. */
  readonly items = input.required<readonly BreadcrumbItem[]>();

  /** Alterna el ícono a check tras copiar. */
  protected readonly copied = signal(false);

  private copiedTimer?: ReturnType<typeof setTimeout>;

  constructor() {
    inject(DestroyRef).onDestroy(() => clearTimeout(this.copiedTimer));
  }

  protected copyLink(): void {
    // `clipboard` solo existe en contextos seguros y el navegador puede negar el permiso; en
    // ambos casos no se confirma una copia que no ocurrió.
    navigator.clipboard
      ?.writeText(window.location.href)
      .then(() => {
        this.copied.set(true);
        clearTimeout(this.copiedTimer);
        this.copiedTimer = setTimeout(() => this.copied.set(false), COPIADO_MS);
      })
      .catch(() => undefined);
  }
}
