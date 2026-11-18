import { Component, DestroyRef, OnInit, computed, inject, input, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { TabsModule } from 'primeng/tabs';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { extractErrorMessage } from '@semantica/core';
import {
  ArchivosDocumentalesComponent,
  EmptyStateComponent,
  ErrorAlertComponent,
  LoadingSpinnerComponent,
  PageHeaderComponent,
} from '../../../../shared';
import { ROUTE_PATHS } from '../../../../core';
import { PqrsDetalle, estadoPqrs } from '../../models/pqrs.model';
import { PqrsService } from '../../services/pqrs.service';

/** Pestañas de la gestión de la PQRS, en el orden de terbio. */
type PestanaGestion = 'analisis' | 'seguimiento' | 'respuesta';

/**
 * Detalle de una PQRS (`cliente_crm_solicitud_detalle` de terbio): a la izquierda la
 * descripción y la gestión de la empresa (análisis, seguimiento y respuestas, en pestañas);
 * a la derecha el resumen, las fechas y el contacto que la registró. Desde la cabecera se
 * consultan los archivos que la empresa cargó a la PQRS.
 */
@Component({
  selector: 'app-pqrs-detalle',
  standalone: true,
  imports: [
    RouterLink,
    DatePipe,
    ButtonModule,
    DialogModule,
    TabsModule,
    TagModule,
    TooltipModule,
    PageHeaderComponent,
    LoadingSpinnerComponent,
    ErrorAlertComponent,
    EmptyStateComponent,
    ArchivosDocumentalesComponent,
  ],
  templateUrl: './pqrs-detalle.component.html',
  styleUrl: './pqrs-detalle.component.scss',
})
export class PqrsDetalleComponent implements OnInit {
  private readonly pqrsService = inject(PqrsService);
  private readonly destroyRef = inject(DestroyRef);

  /** Id de la PQRS, desde el parámetro `:id` de la ruta. */
  readonly id = input.required<string>();

  readonly listaRoute = ROUTE_PATHS.dashboard.crm.pqrs;

  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly pqrs = signal<PqrsDetalle | null>(null);
  readonly archivosVisibles = signal(false);
  readonly pestana = signal<PestanaGestion>('analisis');

  readonly estado = computed(() => {
    const pqrs = this.pqrs();
    return pqrs ? estadoPqrs(pqrs) : null;
  });

  /** Si se registró algún dato del contacto, para mostrar u ocultar su tarjeta. */
  readonly tieneContacto = computed(() => {
    const p = this.pqrs();
    return (
      !!p &&
      [
        p.nombre_contacto,
        p.numero_identificacion_contacto,
        p.cargo_contacto,
        p.telefono_contacto,
        p.correo_contacto,
      ].some((v) => !!v)
    );
  });

  /** Archivos del registro para el diálogo, con el id que le entrega la plantilla. */
  readonly consultarArchivos = (id: number) => this.pqrsService.archivos(id);
  readonly descargarArchivo = (id: number, archivoId: number) =>
    this.pqrsService.descargar(id, archivoId);

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.loading.set(true);
    this.error.set(null);

    this.pqrsService
      .detalle(Number(this.id()))
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (pqrs) => {
          this.pqrs.set(pqrs);
          this.loading.set(false);
        },
        error: (err) => {
          this.error.set(extractErrorMessage(err, 'No se pudo cargar la PQRS.'));
          this.loading.set(false);
        },
      });
  }

  /** `p-tabs` emite el valor como `string | number`. */
  cambiarPestana(valor: string | number | undefined): void {
    this.pestana.set(valor as PestanaGestion);
  }
}
