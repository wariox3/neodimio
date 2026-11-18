import { HttpErrorResponse } from '@angular/common/http';
import { Component, DestroyRef, OnInit, computed, inject, input, signal } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { ConfirmationService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { MessageModule } from 'primeng/message';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { extractErrorMessage, ToastService } from '@semantica/core';
import {
  EmptyStateComponent,
  ErrorAlertComponent,
  LoadingSpinnerComponent,
  PageHeaderComponent,
} from '../../../../shared';
import { ROUTE_PATHS } from '../../../../core';
import {
  CotizacionDetalle,
  CotizacionServicio,
  DIAS_SERVICIO,
  SECTORES,
  cotizacionEditable,
  estadoCotizacion,
  horaCorta,
  negocioCotizacion,
} from '../../models/cotizacion.model';
import { CotizacionService } from '../../services/cotizacion.service';
import { ServicioNuevoComponent } from '../../components/servicio-nuevo/servicio-nuevo.component';

/**
 * Detalle de una cotización (`cliente_crm_contratacion_detalle` de terbio): a la izquierda
 * los servicios cotizados, con sus horas y valores; a la derecha el resumen y los totales.
 * Mientras no esté autorizada, el cliente agrega y quita servicios y fluor la reliquida.
 */
@Component({
  selector: 'app-cotizacion-detalle',
  standalone: true,
  imports: [
    DatePipe,
    DecimalPipe,
    RouterLink,
    ButtonModule,
    ConfirmDialogModule,
    MessageModule,
    TableModule,
    TagModule,
    TooltipModule,
    PageHeaderComponent,
    LoadingSpinnerComponent,
    ErrorAlertComponent,
    EmptyStateComponent,
    ServicioNuevoComponent,
  ],
  providers: [ConfirmationService],
  templateUrl: './cotizacion-detalle.component.html',
  styleUrl: './cotizacion-detalle.component.scss',
})
export class CotizacionDetalleComponent implements OnInit {
  private readonly cotizacionService = inject(CotizacionService);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly toastService = inject(ToastService);
  private readonly destroyRef = inject(DestroyRef);

  /** Id de la cotización, desde el parámetro `:id` de la ruta. */
  readonly id = input.required<string>();

  readonly listaRoute = ROUTE_PATHS.dashboard.crm.cotizaciones;
  readonly dias = DIAS_SERVICIO;
  readonly hora = horaCorta;
  readonly negocio = negocioCotizacion;

  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly cotizacion = signal<CotizacionDetalle | null>(null);
  readonly servicios = signal<CotizacionServicio[]>([]);
  readonly seleccionados = signal<CotizacionServicio[]>([]);
  readonly agregarVisible = signal(false);
  readonly eliminando = signal(false);

  readonly estado = computed(() => {
    const c = this.cotizacion();
    return c ? estadoCotizacion(c) : null;
  });
  readonly editable = computed(() => {
    const c = this.cotizacion();
    return c ? cotizacionEditable(c) : false;
  });
  readonly sector = computed(() => {
    const codigo = this.cotizacion()?.codigo_sector_fk;
    return SECTORES.find((s) => s.value === codigo)?.label ?? codigo ?? '—';
  });
  readonly totalHoras = computed(() => this.servicios().reduce((t, s) => t + s.horas, 0));

  ngOnInit(): void {
    this.cargar();
  }

  /** Encabezado y servicios; después de agregar o quitar, los totales cambian en ambos. */
  cargar(mostrarSpinner = true): void {
    if (mostrarSpinner) this.loading.set(true);
    this.error.set(null);
    const id = Number(this.id());

    forkJoin({
      cotizacion: this.cotizacionService.detalle(id),
      servicios: this.cotizacionService.servicios(id),
    })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: ({ cotizacion, servicios }) => {
          this.cotizacion.set(cotizacion);
          this.servicios.set(servicios);
          this.seleccionados.set([]);
          this.loading.set(false);
        },
        error: (err) => {
          this.error.set(extractErrorMessage(err, 'No se pudo cargar la cotización.'));
          this.loading.set(false);
        },
      });
  }

  confirmarEliminar(): void {
    const cantidad = this.seleccionados().length;
    if (cantidad === 0) return;
    this.confirmationService.confirm({
      header: 'Quitar servicios',
      message:
        cantidad === 1
          ? '¿Quitar el servicio seleccionado de la cotización?'
          : `¿Quitar los ${cantidad} servicios seleccionados de la cotización?`,
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Quitar',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-danger',
      rejectButtonStyleClass: 'p-button-text p-button-secondary',
      accept: () => this.eliminar(),
    });
  }

  private eliminar(): void {
    const ids = this.seleccionados().map((s) => s.codigo_cotizacion_detalle_pk);
    this.eliminando.set(true);
    this.cotizacionService
      .eliminarServicios(Number(this.id()), ids)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.eliminando.set(false);
          this.toastService.success(
            ids.length === 1 ? 'Servicio quitado' : 'Servicios quitados',
            'La cotización se volvió a liquidar.',
          );
          this.cargar(false);
        },
        error: (err: unknown) => {
          this.eliminando.set(false);
          // 0, 403, 429 y 500+ ya los avisa el interceptor.
          if (err instanceof HttpErrorResponse && [400, 404, 422].includes(err.status)) {
            this.toastService.error(
              'No se pudieron quitar',
              extractErrorMessage(err, 'No se pudieron quitar los servicios.'),
            );
          }
        },
      });
  }
}
