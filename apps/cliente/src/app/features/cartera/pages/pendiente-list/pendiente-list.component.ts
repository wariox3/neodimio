import { Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DatePipe, DecimalPipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DatePickerModule } from 'primeng/datepicker';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TableLazyLoadEvent, TableModule } from 'primeng/table';
import { extractErrorMessage, trimFormValues } from '@semantica/core';
import { TrimInputDirective } from '@semantica/ui';
import {
  EmptyStateComponent,
  ErrorAlertComponent,
  LoadingSpinnerComponent,
  PageHeaderComponent,
} from '../../../../shared';
import { EstadoListaService } from '../../../../core';
import { CuentaPendiente } from '../../models/cartera.model';
import { CarteraService } from '../../services/cartera.service';

/**
 * Cartera pendiente del cliente (`cliente_cartera_lista` de terbio): sus cuentas por
 * cobrar con saldo. El formato "Estado de cuenta formal" aún no existe en fluor.
 */
@Component({
  selector: 'app-pendiente-list',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    DatePipe,
    DecimalPipe,
    ButtonModule,
    DatePickerModule,
    InputTextModule,
    SelectModule,
    TableModule,
    TrimInputDirective,
    PageHeaderComponent,
    LoadingSpinnerComponent,
    EmptyStateComponent,
    ErrorAlertComponent,
  ],
  templateUrl: './pendiente-list.component.html',
  styleUrls: ['../../../../shared/styles/listado.scss', './pendiente-list.component.scss'],
})
export class PendienteListComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly carteraService = inject(CarteraService);
  private readonly estadoLista = inject(EstadoListaService);
  private readonly destroyRef = inject(DestroyRef);

  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly cuentas = signal<CuentaPendiente[]>([]);
  readonly totalRecords = signal(0);
  readonly pageSize = signal(50);
  readonly first = signal(0);
  readonly filtrosVisibles = signal(true);

  readonly opcionesVencidas = [{ value: true, label: 'Solo vencidas' }];

  readonly form = this.fb.group({
    numero_documento: [''],
    vencidas: [null as boolean | null],
    fecha_desde: [null as Date | null],
    fecha_hasta: [null as Date | null],
  });

  ngOnInit(): void {
    this.restaurarOBuscar();
  }

  buscar(): void {
    trimFormValues(this.form);
    this.first.set(0);
    this.cargar(1);
  }

  onLazyLoad(event: TableLazyLoadEvent): void {
    const first = event.first ?? 0;
    const rows = event.rows ?? this.pageSize();
    this.first.set(first);
    this.pageSize.set(rows);
    this.cargar(Math.floor(first / rows) + 1);
  }

  limpiar(): void {
    this.form.reset();
    this.buscar();
  }

  toggleFiltros(): void {
    this.filtrosVisibles.update((v) => !v);
  }

  /** Vencida si la fecha de vencimiento ya pasó, el mismo criterio del filtro de fluor. */
  vencida(cuenta: CuentaPendiente): boolean {
    if (!cuenta.fecha_vence) return false;
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    return new Date(cuenta.fecha_vence) < hoy;
  }

  /** Al volver a la pantalla retoma los filtros y la página de esta sesión. */
  private restaurarOBuscar(): void {
    const estado =
      this.estadoLista.leer<ReturnType<typeof this.form.getRawValue>>('cartera-pendientes');
    if (!estado) {
      this.buscar();
      return;
    }
    this.form.patchValue(estado.filtros);
    this.first.set(estado.first);
    this.pageSize.set(estado.rows);
    this.cargar(Math.floor(estado.first / estado.rows) + 1);
  }

  private cargar(page: number): void {
    this.estadoLista.guardar('cartera-pendientes', {
      filtros: this.form.getRawValue(),
      first: this.first(),
      rows: this.pageSize(),
    });

    this.loading.set(true);
    this.error.set(null);

    this.carteraService
      .pendientes({ page, size: this.pageSize(), ...this.form.getRawValue() })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.cuentas.set(res.items);
          this.totalRecords.set(res.total);
          this.loading.set(false);
        },
        error: (err) => {
          this.error.set(extractErrorMessage(err, 'No se pudo cargar la cartera pendiente.'));
          this.loading.set(false);
        },
      });
  }
}
