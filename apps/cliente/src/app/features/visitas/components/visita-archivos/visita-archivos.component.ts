import { Component, DestroyRef, OnInit, inject, input, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { ButtonModule } from 'primeng/button';
import { ToastService, extractErrorMessage } from '../../../../core';
import { ErrorAlertComponent, LoadingSpinnerComponent } from '../../../../shared';
import { tamanoLegible } from '../../../seguridad-social/models/seguridad-social.model';
import { ArchivoVisita } from '../../models/visita.model';
import { VisitaService } from '../../services/visita.service';

/**
 * Archivos que la empresa cargó a la visita, con su descarga
 * (`cliente_crm_visita_archivo` de terbio).
 */
@Component({
  selector: 'app-visita-archivos',
  standalone: true,
  imports: [DatePipe, ButtonModule, LoadingSpinnerComponent, ErrorAlertComponent],
  template: `
    @if (loading()) {
      <app-loading-spinner message="Cargando archivos..." />
    } @else if (error()) {
      <app-error-alert [message]="error()!" [retryable]="true" (retry)="cargar()" />
    } @else if (archivos().length === 0) {
      <p class="sin-archivos">Esta visita no tiene archivos.</p>
    } @else {
      <ul class="archivos">
        @for (archivo of archivos(); track archivo.codigo_archivo_pk) {
          <li class="archivo">
            <i class="pi pi-file archivo__icono" aria-hidden="true"></i>
            <div class="archivo__info">
              <span class="archivo__nombre">{{ archivo.nombre ?? 'Archivo' }}</span>
              @if (archivo.descripcion) {
                <span class="archivo__descripcion">{{ archivo.descripcion }}</span>
              }
              <small>
                {{ archivo.fecha ? (archivo.fecha | date: 'dd/MM/yyyy HH:mm') : 'Sin fecha' }}
                @if (archivo.tamano) {
                  · {{ tamano(archivo.tamano) }}
                }
              </small>
            </div>
            <p-button
              icon="pi pi-download"
              severity="secondary"
              [text]="true"
              [rounded]="true"
              [loading]="descargando() === archivo.codigo_archivo_pk"
              [ariaLabel]="'Descargar ' + (archivo.nombre ?? 'archivo')"
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
      gap: 0.75rem;
      padding: 0.625rem 0;
      border-bottom: 1px solid var(--p-surface-200);

      &:last-child {
        border-bottom: none;
      }

      &__icono {
        color: var(--p-primary-color);
        font-size: 1.125rem;
      }

      &__info {
        display: flex;
        flex-direction: column;
        flex: 1;
        min-width: 0;

        small {
          color: var(--p-text-muted-color);
        }
      }

      &__nombre {
        font-size: 0.875rem;
        overflow-wrap: anywhere;
      }

      &__descripcion {
        font-size: 0.8125rem;
        color: var(--p-text-muted-color);
        overflow-wrap: anywhere;
      }
    }
  `,
})
export class VisitaArchivosComponent implements OnInit {
  private readonly visitaService = inject(VisitaService);
  private readonly toastService = inject(ToastService);
  private readonly destroyRef = inject(DestroyRef);

  readonly visitaId = input.required<number>();

  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly archivos = signal<ArchivoVisita[]>([]);
  /** Archivo que se está descargando, para mostrar su botón cargando. */
  readonly descargando = signal<number | null>(null);

  readonly tamano = tamanoLegible;

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.loading.set(true);
    this.error.set(null);
    this.visitaService
      .archivos(this.visitaId())
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

  descargar(archivo: ArchivoVisita): void {
    this.descargando.set(archivo.codigo_archivo_pk);
    this.visitaService
      .descargar(this.visitaId(), archivo.codigo_archivo_pk)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (blob) => {
          const url = URL.createObjectURL(blob);
          const enlace = document.createElement('a');
          enlace.href = url;
          enlace.download = archivo.nombre ?? `archivo_${archivo.codigo_archivo_pk}`;
          enlace.click();
          setTimeout(() => URL.revokeObjectURL(url), 60_000);
          this.descargando.set(null);
        },
        error: (err: HttpErrorResponse) => {
          this.descargando.set(null);
          // El interceptor ya avisa los errores de conexión, permisos y servidor.
          if (err.status === 404) {
            this.toastService.error('No se pudo descargar', 'No se encuentra el archivo.');
          }
        },
      });
  }
}
