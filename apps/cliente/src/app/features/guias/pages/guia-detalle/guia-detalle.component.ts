import { Component, DestroyRef, OnInit, computed, inject, input, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DatePipe, DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { catchError, forkJoin, of } from 'rxjs';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { extractErrorMessage } from '@semantica/core';
import {
  ErrorAlertComponent,
  LoadingSpinnerComponent,
  PageHeaderComponent,
} from '../../../../shared';
import { ROUTE_PATHS } from '../../../../core';
import { DespachoDeGuia } from '../../../despachos/models/despacho.model';
import { DespachoService } from '../../../despachos/services/despacho.service';
import { GuiaArchivosComponent } from '../../components/guia-archivos/guia-archivos.component';
import { GuiaImprimirComponent } from '../../components/guia-imprimir/guia-imprimir.component';
import { GuiaDetalle, GuiaNovedad } from '../../models/guia.model';
import { GuiaService } from '../../services/guia.service';
import { getEstadoGuia, getIndicadoresDetalle } from '../../utils/guia-estado';

/** Paso de la línea de tiempo de la guía (Ingreso, Transporte, Entrega). */
interface PasoSeguimiento {
  etapa: string;
  titulo: string;
  icono: string;
  fecha: string | null;
  completado: boolean;
  detalle?: string;
}

@Component({
  selector: 'app-guia-detalle',
  standalone: true,
  imports: [
    RouterLink,
    DatePipe,
    DecimalPipe,
    ButtonModule,
    TagModule,
    PageHeaderComponent,
    LoadingSpinnerComponent,
    ErrorAlertComponent,
    GuiaImprimirComponent,
    GuiaArchivosComponent,
  ],
  templateUrl: './guia-detalle.component.html',
  styleUrl: './guia-detalle.component.scss',
})
export class GuiaDetalleComponent implements OnInit {
  private readonly guiaService = inject(GuiaService);
  private readonly despachoService = inject(DespachoService);
  private readonly destroyRef = inject(DestroyRef);

  /** Id de la guía, desde el parámetro `:id` de la ruta. */
  readonly id = input.required<string>();

  readonly listaRoute = ROUTE_PATHS.dashboard.transporte.guias;

  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly guia = signal<GuiaDetalle | null>(null);
  readonly novedades = signal<GuiaNovedad[]>([]);
  readonly despachos = signal<DespachoDeGuia[]>([]);

  readonly estado = computed(() => {
    const guia = this.guia();
    return guia ? getEstadoGuia(guia) : null;
  });

  readonly indicadores = computed(() => {
    const guia = this.guia();
    return guia ? getIndicadoresDetalle(guia) : [];
  });

  readonly total = computed(() => {
    const guia = this.guia();
    return guia ? (guia.vr_flete ?? 0) + (guia.vr_manejo ?? 0) + guia.vr_otros : 0;
  });

  /** Línea de tiempo armada con las fechas de estado de la guía, como en terbio. */
  readonly seguimiento = computed<PasoSeguimiento[]>(() => {
    const guia = this.guia();
    if (!guia) return [];

    return [
      {
        etapa: 'Ingreso',
        titulo: 'Recogida',
        icono: 'pi pi-clipboard',
        fecha: guia.fecha_recogido,
        completado: guia.estado_recogido,
        detalle: guia.usuario ? `Por ${guia.usuario}` : undefined,
      },
      {
        etapa: 'Ingreso',
        titulo: 'Ingreso a bodega de origen',
        icono: 'pi pi-home',
        fecha: guia.fecha_ingreso_operacion ?? guia.fecha_ingreso,
        completado: guia.estado_ingreso,
      },
      {
        etapa: 'Transporte',
        titulo: guia.estado_despachado ? 'Despachada' : 'Pendiente de despacho',
        icono: 'pi pi-truck',
        fecha: guia.fecha_despacho,
        completado: guia.estado_despachado,
        detalle: guia.codigo_despacho_fk
          ? `Despacho ${guia.codigo_despacho_fk}` +
            (guia.cantidad_despachos > 1 ? ` · ${guia.cantidad_despachos} despachos` : '')
          : undefined,
      },
      {
        etapa: 'Entrega',
        titulo: guia.estado_entregado ? 'Entregada' : 'Pendiente de entrega',
        icono: 'pi pi-thumbs-up',
        fecha: guia.fecha_entrega,
        completado: guia.estado_entregado,
      },
      {
        etapa: 'Entrega',
        titulo: 'Cumplida',
        icono: 'pi pi-check-circle',
        fecha: guia.fecha_cumplido,
        completado: guia.estado_cumplido,
      },
    ];
  });

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    const id = Number(this.id());
    this.loading.set(true);
    this.error.set(null);

    forkJoin({
      guia: this.guiaService.obtener(id),
      // Novedades y despachos complementan el detalle: si fallan, la guía se muestra igual.
      novedades: this.guiaService.novedades(id).pipe(catchError(() => of([]))),
      despachos: this.despachoService.deGuia(id).pipe(catchError(() => of([]))),
    })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: ({ guia, novedades, despachos }) => {
          this.guia.set(guia);
          this.novedades.set(novedades);
          this.despachos.set(despachos);
          this.loading.set(false);
        },
        error: (err) => {
          this.error.set(extractErrorMessage(err, 'No se pudo cargar la guía.'));
          this.loading.set(false);
        },
      });
  }
}
