import { Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DatePipe, DecimalPipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DatePickerModule } from 'primeng/datepicker';
import { MessageModule } from 'primeng/message';
import { TableModule, TablePageEvent } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { extractErrorMessage } from '@semantica/core';
import {
  EmptyStateComponent,
  ErrorAlertComponent,
  LoadingSpinnerComponent,
  PageHeaderComponent,
} from '../../../../shared';
import { EstadoListaService } from '../../../../core';
import { Factura, numeroFactura } from '../../models/factura.model';
import { FacturaService, MAX_FACTURAS } from '../../services/factura.service';

/**
 * Facturas de venta del cliente (`cliente_venta_factura_lista` de terbio): las
 * aprobadas. La descarga del PDF aún no existe en fluor.
 */
@Component({
  selector: 'app-factura-list',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    DatePipe,
    DecimalPipe,
    ButtonModule,
    DatePickerModule,
    MessageModule,
    TableModule,
    TagModule,
    PageHeaderComponent,
    LoadingSpinnerComponent,
    EmptyStateComponent,
    ErrorAlertComponent,
  ],
  templateUrl: './factura-list.component.html',
  styleUrl: '../../../../shared/styles/listado.scss',
})
export class FacturaListComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly facturaService = inject(FacturaService);
  private readonly estadoLista = inject(EstadoListaService);
  private readonly destroyRef = inject(DestroyRef);

  readonly maxConsulta = MAX_FACTURAS;
  readonly numeroFactura = numeroFactura;
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly facturas = signal<Factura[]>([]);
  /** Fluor tiene más facturas de las consultadas: puede haber facturas más antiguas. */
  readonly incompleto = signal(false);
  readonly pageSize = signal(25);
  readonly first = signal(0);
  readonly filtrosVisibles = signal(true);

  readonly form = this.fb.group({
    fecha_desde: [null as Date | null],
    fecha_hasta: [null as Date | null],
  });

  ngOnInit(): void {
    const estado = this.estadoLista.leer<ReturnType<typeof this.form.getRawValue>>('facturas');
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
    this.estadoLista.guardar('facturas', {
      filtros: this.form.getRawValue(),
      first: this.first(),
      rows: this.pageSize(),
    });
  }

  private cargar(): void {
    this.guardarEstado();
    this.loading.set(true);
    this.error.set(null);

    this.facturaService
      .listar(this.form.getRawValue())
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.facturas.set(res.items);
          this.incompleto.set(res.incompleto);
          this.loading.set(false);
        },
        error: (err) => {
          this.error.set(extractErrorMessage(err, 'No se pudieron cargar las facturas.'));
          this.loading.set(false);
        },
      });
  }
}
