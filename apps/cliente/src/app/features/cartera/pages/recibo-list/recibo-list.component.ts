import { Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { HttpErrorResponse } from '@angular/common/http';
import { DatePipe, DecimalPipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DatePickerModule } from 'primeng/datepicker';
import { MessageModule } from 'primeng/message';
import { TableModule, TablePageEvent } from 'primeng/table';
import { TooltipModule } from 'primeng/tooltip';
import { extractErrorMessage, ToastService } from '@semantica/core';
import {
  abrirPdf,
  EmptyStateComponent,
  ErrorAlertComponent,
  LoadingSpinnerComponent,
  PageHeaderComponent,
} from '../../../../shared';
import { EstadoListaService } from '../../../../core';
import { MovimientoCartera, reciboImprimible } from '../../models/cartera.model';
import { CarteraService, MAX_MOVIMIENTOS } from '../../services/cartera.service';

/**
 * Recibos del cliente (`cliente_cartera_recibos_lista` de terbio): sus movimientos de
 * cartera aprobados y no anulados, con la impresión de los recibos de caja y anticipos.
 */
@Component({
  selector: 'app-recibo-list',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    DatePipe,
    DecimalPipe,
    ButtonModule,
    DatePickerModule,
    MessageModule,
    TableModule,
    TooltipModule,
    PageHeaderComponent,
    LoadingSpinnerComponent,
    EmptyStateComponent,
    ErrorAlertComponent,
  ],
  templateUrl: './recibo-list.component.html',
  styleUrl: '../../../../shared/styles/listado.scss',
})
export class ReciboListComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly carteraService = inject(CarteraService);
  private readonly estadoLista = inject(EstadoListaService);
  private readonly toastService = inject(ToastService);
  private readonly destroyRef = inject(DestroyRef);

  readonly maxConsulta = MAX_MOVIMIENTOS;
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly recibos = signal<MovimientoCartera[]>([]);
  /** Fluor tiene más movimientos de los consultados: puede haber recibos más antiguos. */
  readonly incompleto = signal(false);
  readonly pageSize = signal(25);
  readonly first = signal(0);
  readonly filtrosVisibles = signal(true);
  /** Recibo que se está imprimiendo, para mostrar su botón cargando. */
  readonly imprimiendo = signal<number | null>(null);
  readonly imprimible = reciboImprimible;

  readonly form = this.fb.group({
    fecha_desde: [null as Date | null],
    fecha_hasta: [null as Date | null],
  });

  imprimir(recibo: MovimientoCartera): void {
    const id = recibo.codigo_movimiento_pk;
    this.imprimiendo.set(id);
    abrirPdf(this.carteraService.imprimirRecibo(id), `recibo_${id}.pdf`)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => this.imprimiendo.set(null),
        error: (err: HttpErrorResponse) => {
          this.imprimiendo.set(null);
          // El resto de estados ya los avisa el interceptor.
          const mensaje =
            err.status === 404
              ? 'No se encontró el recibo.'
              : err.status === 409
                ? 'Este movimiento no tiene formato de impresión.'
                : null;
          if (mensaje) this.toastService.error('No se pudo imprimir', mensaje);
        },
      });
  }

  ngOnInit(): void {
    const estado = this.estadoLista.leer<ReturnType<typeof this.form.getRawValue>>('recibos');
    if (estado) {
      this.form.patchValue(estado.filtros);
      this.first.set(estado.first);
      this.pageSize.set(estado.rows);
    }
    this.cargar();
  }

  buscar(): void {
    this.first.set(0);
    this.cargar();
  }

  limpiar(): void {
    this.form.reset();
    this.buscar();
  }

  onPage(event: TablePageEvent): void {
    this.first.set(event.first);
    this.pageSize.set(event.rows);
    this.guardarEstado();
  }

  toggleFiltros(): void {
    this.filtrosVisibles.update((v) => !v);
  }

  private guardarEstado(): void {
    this.estadoLista.guardar('recibos', {
      filtros: this.form.getRawValue(),
      first: this.first(),
      rows: this.pageSize(),
    });
  }

  private cargar(): void {
    this.guardarEstado();
    this.loading.set(true);
    this.error.set(null);

    this.carteraService
      .recibos(this.form.getRawValue())
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.recibos.set(res.items);
          this.incompleto.set(res.incompleto);
          this.loading.set(false);
        },
        error: (err) => {
          this.error.set(extractErrorMessage(err, 'No se pudieron cargar los recibos.'));
          this.loading.set(false);
        },
      });
  }
}
