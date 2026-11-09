import { Component, DestroyRef, inject, input, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DatePipe } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { Fichero, FicherosService, extractErrorMessage } from '@semantica/core';
import { ErrorAlertComponent, LoadingSpinnerComponent } from '@semantica/ui';

/**
 * Archivos que fluor guarda para un registro (`/doc/fichero/modelo/{modelo}/{codigo}`),
 * con su descarga. Lo usan el detalle de la guía y la información del cliente.
 */
@Component({
  selector: 'app-archivos',
  standalone: true,
  imports: [DatePipe, ButtonModule, LoadingSpinnerComponent, ErrorAlertComponent],
  template: `
    @if (loading()) {
      <app-loading-spinner message="Cargando archivos..." />
    } @else if (error()) {
      <app-error-alert [message]="error()!" [retryable]="true" (retry)="cargar()" />
    } @else if (archivos().length === 0) {
      <p class="sin-archivos">{{ mensajeVacio() }}</p>
    } @else {
      <ul class="archivos">
        @for (archivo of archivos(); track archivo.codigo_fichero_pk) {
          <li class="archivo">
            <div class="archivo__info">
              <span class="archivo__nombre">{{ archivo.nombre }}.{{ archivo.extension }}</span>
              <small>{{ archivo.fecha | date: 'dd/MM/yyyy HH:mm' }}</small>
            </div>
            <p-button
              icon="pi pi-download"
              severity="secondary"
              [text]="true"
              [rounded]="true"
              [ariaLabel]="'Descargar ' + archivo.nombre"
              (onClick)="descargar(archivo)"
            />
          </li>
        }
      </ul>
    }
  `,
  styles: `
    .sin-archivos {
      margin: 0;
      font-size: 0.875rem;
      color: var(--p-text-muted-color);
    }

    .archivos {
      list-style: none;
      margin: 0;
      padding: 0;
    }

    .archivo {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 0.75rem;
      padding: 0.5rem 0;
      border-bottom: 1px solid var(--p-surface-200);

      &:last-child {
        border-bottom: none;
      }

      &__info {
        display: flex;
        flex-direction: column;
        min-width: 0;

        small {
          color: var(--p-text-muted-color);
        }
      }

      &__nombre {
        font-size: 0.875rem;
        overflow-wrap: anywhere;
      }
    }
  `,
})
export class ArchivosComponent implements OnInit {
  private readonly ficherosService = inject(FicherosService);
  private readonly destroyRef = inject(DestroyRef);

  /** Modelo de fluor, por ejemplo `TteGuia` o `GenTercero`. */
  readonly modelo = input.required<string>();
  /** Id del registro dentro del modelo. */
  readonly codigo = input.required<number | string>();
  readonly mensajeVacio = input('No hay archivos.');

  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly archivos = signal<Fichero[]>([]);

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.loading.set(true);
    this.error.set(null);
    this.ficherosService
      .getFicheros(this.modelo(), String(this.codigo()))
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (archivos) => {
          this.archivos.set(archivos);
          this.loading.set(false);
        },
        error: (err) => {
          this.error.set(extractErrorMessage(err, 'No se pudieron cargar los archivos.'));
          this.loading.set(false);
        },
      });
  }

  descargar(archivo: Fichero): void {
    // Se abre dentro del clic para que el navegador no la bloquee.
    const pestana = window.open('', '_blank');
    this.ficherosService.getDescargarUrl(archivo.codigo_fichero_pk).subscribe({
      next: ({ url }) => {
        if (!pestana) return;
        pestana.opener = null;
        pestana.location.href = url;
      },
      error: () => pestana?.close(),
    });
  }
}
