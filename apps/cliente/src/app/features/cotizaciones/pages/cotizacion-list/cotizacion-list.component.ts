import { Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { MessageModule } from 'primeng/message';
import { TableModule, TablePageEvent } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { extractErrorMessage } from '@semantica/core';
import {
  EmptyStateComponent,
  ErrorAlertComponent,
  LoadingSpinnerComponent,
  PageHeaderComponent,
} from '../../../../shared';
import { EstadoListaService, ROUTE_PATHS } from '../../../../core';
import { Cotizacion, estadoCotizacion, negocioCotizacion } from '../../models/cotizacion.model';
import { CotizacionService, MAX_COTIZACIONES } from '../../services/cotizacion.service';

/** Clave con la que se conserva la página de la tabla en la sesión. */
const ESTADO_LISTA = 'cotizaciones';

/**
 * Cotizaciones del cliente (`cliente_crm_contratacion_lista` de terbio), de la más
 * reciente a la más antigua. Desde aquí se solicita una nueva y se abre su detalle.
 */
@Component({
  selector: 'app-cotizacion-list',
  standalone: true,
  imports: [
    DatePipe,
    DecimalPipe,
    RouterLink,
    ButtonModule,
    MessageModule,
    TableModule,
    TagModule,
    TooltipModule,
    PageHeaderComponent,
    LoadingSpinnerComponent,
    EmptyStateComponent,
    ErrorAlertComponent,
  ],
  templateUrl: './cotizacion-list.component.html',
  styleUrl: '../../../../shared/styles/listado.scss',
})
export class CotizacionListComponent implements OnInit {
  private readonly cotizacionService = inject(CotizacionService);
  private readonly estadoLista = inject(EstadoListaService);
  private readonly destroyRef = inject(DestroyRef);

  readonly rutas = ROUTE_PATHS.dashboard.crm;
  readonly maxConsulta = MAX_COTIZACIONES;
  readonly estado = estadoCotizacion;
  readonly negocio = negocioCotizacion;
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly cotizaciones = signal<Cotizacion[]>([]);
  /** fluor tiene más cotizaciones del cliente de las consultadas. */
  readonly incompleto = signal(false);
  readonly pageSize = signal(50);
  readonly first = signal(0);

  ngOnInit(): void {
    const estado = this.estadoLista.leer<Record<string, never>>(ESTADO_LISTA);
    if (estado) {
      this.first.set(estado.first);
      this.pageSize.set(estado.rows);
    }
    this.cargar();
  }

  /** Vuelve a consultar desde la primera página (botón de reintentar). */
  recargar(): void {
    this.first.set(0);
    this.guardarEstado();
    this.cargar();
  }

  onPage(event: TablePageEvent): void {
    this.first.set(event.first);
    this.pageSize.set(event.rows);
    this.guardarEstado();
  }

  private guardarEstado(): void {
    this.estadoLista.guardar(ESTADO_LISTA, {
      filtros: {},
      first: this.first(),
      rows: this.pageSize(),
    });
  }

  private cargar(): void {
    this.loading.set(true);
    this.error.set(null);

    this.cotizacionService
      .listar()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.cotizaciones.set(res.items);
          this.incompleto.set(res.incompleto);
          this.loading.set(false);
        },
        error: (err) => {
          this.error.set(extractErrorMessage(err, 'No se pudieron cargar las cotizaciones.'));
          this.loading.set(false);
        },
      });
  }
}
