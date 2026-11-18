import { Component, DestroyRef, OnInit, inject, input, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ButtonModule } from 'primeng/button';
import { ToastService, extractErrorMessage } from '@semantica/core';
import { ErrorAlertComponent, LoadingSpinnerComponent } from '@semantica/ui';
import { ArchivoDocumental, tamanoLegible } from './archivo-documental.model';

/**
 * Archivos que holmio cargó a un registro (`doc_archivo`), con su descarga. Cada pantalla
 * entrega cómo consultarlos y descargarlos, porque fluor los expone por registro y valida
 * que sean del cliente.
 *
 * Distinto de `ArchivosComponent`, que lista los ficheros que fluor guarda en `doc/fichero`.
 */
@Component({
  selector: 'app-archivos-documentales',
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
        @for (archivo of archivos(); track archivo.codigo_archivo_pk) {
          <li class="archivo">
            <i class="pi pi-file archivo__icono" aria-hidden="true"></i>
            <div class="archivo__info">
              <span class="archivo__nombre">{{ archivo.nombre ?? nombrePorDefecto() }}</span>
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
              [ariaLabel]="'Descargar ' + (archivo.nombre ?? nombrePorDefecto())"
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
export class ArchivosDocumentalesComponent implements OnInit {
  private readonly toastService = inject(ToastService);
  private readonly destroyRef = inject(DestroyRef);

  /** Id del registro dueño de los archivos (visita, PQRS, aporte del empleado...). */
  readonly registroId = input.required<number>();
  /** Consulta los archivos del registro. */
  readonly consultar = input.required<(registroId: number) => Observable<ArchivoDocumental[]>>();
  /** Descarga el contenido de un archivo del registro. */
  readonly descargarArchivo =
    input.required<(registroId: number, archivoId: number) => Observable<Blob>>();
  readonly mensajeVacio = input('Este registro no tiene archivos.');
  /** Nombre que se muestra y con el que se guarda un archivo que no tiene nombre. */
  readonly nombrePorDefecto = input('Archivo');
  /** Mensaje cuando fluor responde 404 al descargar. */
  readonly mensajeNoEncontrado = input('No se encuentra el archivo.');

  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly archivos = signal<ArchivoDocumental[]>([]);
  /** Archivo que se está descargando, para mostrar su botón cargando. */
  readonly descargando = signal<number | null>(null);

  readonly tamano = tamanoLegible;

  /** Nombre para guardar un archivo sin nombre: `soporte_12.pdf`. */
  private nombreDescarga(archivo: ArchivoDocumental): string {
    const base = `${this.nombrePorDefecto().toLowerCase()}_${archivo.codigo_archivo_pk}`;
    return archivo.extension_original ? `${base}.${archivo.extension_original}` : base;
  }

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.loading.set(true);
    this.error.set(null);
    this.consultar()(this.registroId())
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

  descargar(archivo: ArchivoDocumental): void {
    this.descargando.set(archivo.codigo_archivo_pk);
    this.descargarArchivo()(this.registroId(), archivo.codigo_archivo_pk)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (blob) => {
          const url = URL.createObjectURL(blob);
          const enlace = document.createElement('a');
          enlace.href = url;
          enlace.download = archivo.nombre ?? this.nombreDescarga(archivo);
          enlace.click();
          setTimeout(() => URL.revokeObjectURL(url), 60_000);
          this.descargando.set(null);
        },
        error: (err: HttpErrorResponse) => {
          this.descargando.set(null);
          // El interceptor ya avisa los errores de conexión, permisos y servidor.
          if (err.status === 404) {
            this.toastService.error('No se pudo descargar', this.mensajeNoEncontrado());
          }
        },
      });
  }
}
