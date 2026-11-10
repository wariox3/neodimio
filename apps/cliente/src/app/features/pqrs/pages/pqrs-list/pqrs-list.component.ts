import { Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
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
import { EstadoListaService } from '../../../../core';
import { Pqrs, estadoPqrs } from '../../models/pqrs.model';
import { MAX_PQRS, PqrsService } from '../../services/pqrs.service';

/** Clave con la que se conserva la página de la tabla en la sesión. */
const ESTADO_LISTA = 'pqrs';

/**
 * PQRS del cliente (`cliente_crm_solicitud_lista` de terbio): sus peticiones, quejas,
 * reclamos y sugerencias, de la más reciente a la más antigua.
 */
@Component({
  selector: 'app-pqrs-list',
  standalone: true,
  imports: [
    DatePipe,
    MessageModule,
    TableModule,
    TagModule,
    TooltipModule,
    PageHeaderComponent,
    LoadingSpinnerComponent,
    EmptyStateComponent,
    ErrorAlertComponent,
  ],
  templateUrl: './pqrs-list.component.html',
  styleUrls: ['../../../../shared/styles/listado.scss', './pqrs-list.component.scss'],
})
export class PqrsListComponent implements OnInit {
  private readonly pqrsService = inject(PqrsService);
  private readonly estadoLista = inject(EstadoListaService);
  private readonly destroyRef = inject(DestroyRef);

  readonly maxConsulta = MAX_PQRS;
  readonly estado = estadoPqrs;
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly registros = signal<Pqrs[]>([]);
  /** fluor tiene más PQRS del cliente de las consultadas. */
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

    this.pqrsService
      .listar()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.registros.set(res.items);
          this.incompleto.set(res.incompleto);
          this.loading.set(false);
        },
        error: (err) => {
          this.error.set(extractErrorMessage(err, 'No se pudieron cargar las PQRS.'));
          this.loading.set(false);
        },
      });
  }
}
