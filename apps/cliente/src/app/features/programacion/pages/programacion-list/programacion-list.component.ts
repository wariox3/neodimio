import { Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DatePickerModule } from 'primeng/datepicker';
import { MessageModule } from 'primeng/message';
import { TableModule, TablePageEvent } from 'primeng/table';
import { extractErrorMessage } from '@semantica/core';
import {
  EmptyStateComponent,
  ErrorAlertComponent,
  LoadingSpinnerComponent,
  PageHeaderComponent,
} from '../../../../shared';
import { EstadoListaService } from '../../../../core';
import { Programacion, diasDelMes } from '../../models/programacion.model';
import { MAX_PROGRAMACIONES, ProgramacionService } from '../../services/programacion.service';

/** Primer día del mes en curso: terbio no deja consultar meses futuros. */
function mesActual(): Date {
  const hoy = new Date();
  return new Date(hoy.getFullYear(), hoy.getMonth(), 1);
}

/**
 * Programación de los empleados que prestan servicio al cliente
 * (`cliente_programacion_lista` de terbio): un mes a la vez, agrupada por puesto.
 */
@Component({
  selector: 'app-programacion-list',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    ButtonModule,
    DatePickerModule,
    MessageModule,
    TableModule,
    PageHeaderComponent,
    LoadingSpinnerComponent,
    EmptyStateComponent,
    ErrorAlertComponent,
  ],
  templateUrl: './programacion-list.component.html',
  styleUrls: ['../../../../shared/styles/listado.scss', './programacion-list.component.scss'],
})
export class ProgramacionListComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly programacionService = inject(ProgramacionService);
  private readonly estadoLista = inject(EstadoListaService);
  private readonly destroyRef = inject(DestroyRef);

  readonly maxConsulta = MAX_PROGRAMACIONES;
  readonly mesMaximo = mesActual();
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly programaciones = signal<Programacion[]>([]);
  /** Fluor tiene más programaciones de las consultadas para el mes. */
  readonly incompleto = signal(false);
  readonly pageSize = signal(50);
  readonly first = signal(0);
  readonly filtrosVisibles = signal(true);

  readonly form = this.fb.group({ mes: [mesActual() as Date | null] });

  /** Mes de la última consulta: define las columnas de días. */
  private readonly mesConsultado = signal(mesActual());
  readonly dias = computed(() => {
    const mes = this.mesConsultado();
    return diasDelMes(mes.getFullYear(), mes.getMonth() + 1);
  });
  /** Columnas fijas (código, empleado y cargo) más una por día, para el encabezado de puesto. */
  readonly totalColumnas = computed(() => 3 + this.dias().length);

  private readonly mesElegido = toSignal(this.form.controls.mes.valueChanges, {
    initialValue: this.form.controls.mes.value,
  });
  readonly sinMes = computed(() => !this.mesElegido());

  ngOnInit(): void {
    const estado = this.estadoLista.leer<ReturnType<typeof this.form.getRawValue>>('programacion');
    if (estado?.filtros.mes) {
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

  /** Vuelve al mes en curso, el valor por defecto de terbio. */
  limpiar(): void {
    this.form.reset({ mes: mesActual() });
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
    this.estadoLista.guardar('programacion', {
      filtros: this.form.getRawValue(),
      first: this.first(),
      rows: this.pageSize(),
    });
  }

  private cargar(): void {
    const mes = this.form.controls.mes.value;
    if (!mes) return;
    this.guardarEstado();
    this.loading.set(true);
    this.error.set(null);

    this.programacionService
      .delMes(mes.getFullYear(), mes.getMonth() + 1)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.mesConsultado.set(mes);
          this.programaciones.set(res.items);
          this.incompleto.set(res.incompleto);
          this.loading.set(false);
        },
        error: (err) => {
          this.error.set(extractErrorMessage(err, 'No se pudo cargar la programación.'));
          this.loading.set(false);
        },
      });
  }
}
