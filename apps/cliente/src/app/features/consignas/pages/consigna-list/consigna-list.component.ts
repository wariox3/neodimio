import { Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { MessageModule } from 'primeng/message';
import { SelectModule } from 'primeng/select';
import { TableModule, TablePageEvent } from 'primeng/table';
import { extractErrorMessage } from '@semantica/core';
import {
  EmptyStateComponent,
  ErrorAlertComponent,
  LoadingSpinnerComponent,
  PageHeaderComponent,
} from '../../../../shared';
import { EstadoListaService } from '../../../../core';
import {
  CONSIGNAS_GENERALES,
  Consigna,
  clavePuesto,
  puestosDeConsignas,
} from '../../models/consigna.model';
import { ConsignaService, MAX_CONSIGNAS } from '../../services/consigna.service';

/** Clave con la que se conservan el puesto y la página de la tabla en la sesión. */
const ESTADO_LISTA = 'consignas';

/** Filtro de la lista: la clave del puesto elegido, o `null` para todos. */
interface FiltrosConsigna {
  puesto: string | null;
}

/**
 * Consignas de los puestos del cliente (`cliente_operacion_consigna_lista` de terbio): las
 * instrucciones que debe cumplir el personal en cada puesto, más las generales.
 */
@Component({
  selector: 'app-consigna-list',
  standalone: true,
  imports: [
    FormsModule,
    MessageModule,
    SelectModule,
    TableModule,
    PageHeaderComponent,
    LoadingSpinnerComponent,
    EmptyStateComponent,
    ErrorAlertComponent,
  ],
  templateUrl: './consigna-list.component.html',
  styleUrls: ['../../../../shared/styles/listado.scss', './consigna-list.component.scss'],
})
export class ConsignaListComponent implements OnInit {
  private readonly consignaService = inject(ConsignaService);
  private readonly estadoLista = inject(EstadoListaService);
  private readonly destroyRef = inject(DestroyRef);

  readonly maxConsulta = MAX_CONSIGNAS;
  readonly generales = CONSIGNAS_GENERALES;
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly consignas = signal<Consigna[]>([]);
  /** fluor tiene más consignas del cliente de las consultadas. */
  readonly incompleto = signal(false);
  readonly pageSize = signal(50);
  readonly first = signal(0);
  /** Clave del puesto elegido en el filtro (ver `clavePuesto`); `null` muestra todos. */
  readonly puesto = signal<string | null>(null);

  readonly puestos = computed(() => puestosDeConsignas(this.consignas()));

  readonly visibles = computed(() => {
    const puesto = this.puesto();
    return puesto === null
      ? this.consignas()
      : this.consignas().filter((c) => clavePuesto(c) === puesto);
  });

  ngOnInit(): void {
    const estado = this.estadoLista.leer<FiltrosConsigna>(ESTADO_LISTA);
    if (estado) {
      this.puesto.set(estado.filtros.puesto ?? null);
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

  filtrarPuesto(puesto: string | null): void {
    this.puesto.set(puesto ?? null);
    this.first.set(0);
    this.guardarEstado();
  }

  onPage(event: TablePageEvent): void {
    this.first.set(event.first);
    this.pageSize.set(event.rows);
    this.guardarEstado();
  }

  private guardarEstado(): void {
    this.estadoLista.guardar<FiltrosConsigna>(ESTADO_LISTA, {
      filtros: { puesto: this.puesto() },
      first: this.first(),
      rows: this.pageSize(),
    });
  }

  private cargar(): void {
    this.loading.set(true);
    this.error.set(null);

    this.consignaService
      .listar()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.consignas.set(res.items);
          this.incompleto.set(res.incompleto);
          // Si el puesto guardado ya no tiene consignas, se vuelve a mostrar todo
          const puesto = this.puesto();
          if (puesto !== null && !res.items.some((c) => clavePuesto(c) === puesto)) {
            this.puesto.set(null);
            this.first.set(0);
          }
          this.loading.set(false);
        },
        error: (err) => {
          this.error.set(extractErrorMessage(err, 'No se pudieron cargar las consignas.'));
          this.loading.set(false);
        },
      });
  }
}
