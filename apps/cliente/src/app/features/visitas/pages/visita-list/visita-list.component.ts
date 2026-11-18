import { Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { MessageModule } from 'primeng/message';
import { TableModule, TablePageEvent } from 'primeng/table';
import { TooltipModule } from 'primeng/tooltip';
import { extractErrorMessage } from '@semantica/core';
import {
  EmptyStateComponent,
  ErrorAlertComponent,
  LoadingSpinnerComponent,
  PageHeaderComponent,
} from '../../../../shared';
import { EstadoListaService, ROUTE_PATHS } from '../../../../core';
import { Visita } from '../../models/visita.model';
import { MAX_VISITAS, VisitaService } from '../../services/visita.service';
import { VisitaImprimirComponent } from '../../components/visita-imprimir/visita-imprimir.component';

/** Clave con la que se conserva la página de la tabla en la sesión. */
const ESTADO_LISTA = 'visitas';

/**
 * Visitas que la empresa le hizo al cliente (`cliente_crm_visita_lista` de terbio), de la
 * más reciente a la más antigua, con su detalle y la impresión del formato.
 */
@Component({
  selector: 'app-visita-list',
  standalone: true,
  imports: [
    RouterLink,
    DatePipe,
    ButtonModule,
    MessageModule,
    TableModule,
    TooltipModule,
    PageHeaderComponent,
    LoadingSpinnerComponent,
    EmptyStateComponent,
    ErrorAlertComponent,
    VisitaImprimirComponent,
  ],
  templateUrl: './visita-list.component.html',
  styleUrls: ['../../../../shared/styles/listado.scss', './visita-list.component.scss'],
})
export class VisitaListComponent implements OnInit {
  private readonly visitaService = inject(VisitaService);
  private readonly estadoLista = inject(EstadoListaService);
  private readonly destroyRef = inject(DestroyRef);

  readonly rutas = ROUTE_PATHS.dashboard.crm;
  readonly maxConsulta = MAX_VISITAS;
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly visitas = signal<Visita[]>([]);
  /** fluor tiene más visitas del cliente de las consultadas. */
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

    this.visitaService
      .listar()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.visitas.set(res.items);
          this.incompleto.set(res.incompleto);
          this.loading.set(false);
        },
        error: (err) => {
          this.error.set(extractErrorMessage(err, 'No se pudieron cargar las visitas.'));
          this.loading.set(false);
        },
      });
  }
}
