import { Component, DestroyRef, OnInit, inject, input, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { ButtonModule } from 'primeng/button';
import { ToastService, extractErrorMessage } from '../../../../core';
import { ErrorAlertComponent, LoadingSpinnerComponent } from '../../../../shared';
import {
  ArchivoSeguridadSocial,
  SeguridadSocial,
  tamanoLegible,
} from '../../models/seguridad-social.model';
import { SeguridadSocialService } from '../../services/seguridad-social.service';

/**
 * Soportes de la seguridad social de un empleado, con su descarga
 * (`cliente_recursohumano_seguridadsocial_archivo` de terbio).
 */
@Component({
  selector: 'app-seguridad-social-archivos',
  standalone: true,
  imports: [DatePipe, ButtonModule, LoadingSpinnerComponent, ErrorAlertComponent],
  template: `
    @if (loading()) {
      <app-loading-spinner message="Cargando archivos..." />
    } @else if (error()) {
      <app-error-alert [message]="error()!" [retryable]="true" (retry)="cargar()" />
    } @else if (archivos().length === 0) {
      <p class="sin-archivos">Aún no se ha cargado el soporte de este empleado.</p>
    } @else {
      <ul class="archivos">
        @for (archivo of archivos(); track archivo.codigo_archivo_pk) {
          <li class="archivo">
            <div class="archivo__info">
              <span class="archivo__nombre">{{ archivo.nombre ?? 'Soporte' }}</span>
              <small>
                {{ archivo.fecha | date: 'dd/MM/yyyy HH:mm' }}
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
              [ariaLabel]="'Descargar ' + (archivo.nombre ?? 'soporte')"
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
export class SeguridadSocialArchivosComponent implements OnInit {
  private readonly seguridadSocialService = inject(SeguridadSocialService);
  private readonly toastService = inject(ToastService);
  private readonly destroyRef = inject(DestroyRef);

  readonly registro = input.required<SeguridadSocial>();

  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly archivos = signal<ArchivoSeguridadSocial[]>([]);
  /** Archivo que se está descargando, para mostrar su botón cargando. */
  readonly descargando = signal<number | null>(null);

  readonly tamano = tamanoLegible;

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.loading.set(true);
    this.error.set(null);
    this.seguridadSocialService
      .archivos(this.registro().codigo_aporte_contrato_pk)
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

  descargar(archivo: ArchivoSeguridadSocial): void {
    this.descargando.set(archivo.codigo_archivo_pk);
    this.seguridadSocialService
      .descargar(this.registro().codigo_aporte_contrato_pk, archivo.codigo_archivo_pk)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (blob) => {
          const url = URL.createObjectURL(blob);
          const enlace = document.createElement('a');
          enlace.href = url;
          enlace.download = archivo.nombre ?? `soporte_${archivo.codigo_archivo_pk}.pdf`;
          enlace.click();
          setTimeout(() => URL.revokeObjectURL(url), 60_000);
          this.descargando.set(null);
        },
        error: (err: HttpErrorResponse) => {
          this.descargando.set(null);
          // El interceptor ya avisa los errores de conexión, permisos y servidor.
          if (err.status === 404) {
            this.toastService.error(
              'No se pudo descargar',
              'No se encuentra el archivo de la seguridad social de este empleado.',
            );
          }
        },
      });
  }
}
