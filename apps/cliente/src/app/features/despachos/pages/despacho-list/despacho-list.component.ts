import { Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { DatePipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { catchError, of } from 'rxjs';
import { ButtonModule } from 'primeng/button';
import { DatePickerModule } from 'primeng/datepicker';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { TableLazyLoadEvent, TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ToastService, extractErrorMessage, trimFormValues } from '@semantica/core';
import { TrimInputDirective } from '@semantica/ui';
import {
  EmptyStateComponent,
  ErrorAlertComponent,
  LoadingSpinnerComponent,
  PageHeaderComponent,
} from '../../../../shared';
import { EstadoListaService } from '../../../../core';
import { CatalogoService } from '../../../catalogos/services/catalogo.service';
import { Despacho } from '../../models/despacho.model';
import { DespachoService } from '../../services/despacho.service';

/**
 * Lista de despachos de "Gestión logística" (`cliente_transporte_despacho_lista` de
 * terbio). Es de solo lectura: fluor aún no permite crear, autorizar ni aprobar.
 */
@Component({
  selector: 'app-despacho-list',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    DatePipe,
    ButtonModule,
    DatePickerModule,
    InputNumberModule,
    InputTextModule,
    TableModule,
    TagModule,
    TrimInputDirective,
    PageHeaderComponent,
    LoadingSpinnerComponent,
    EmptyStateComponent,
    ErrorAlertComponent,
  ],
  templateUrl: './despacho-list.component.html',
  styleUrl: '../../../../shared/styles/listado.scss',
})
export class DespachoListComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly despachoService = inject(DespachoService);
  private readonly catalogoService = inject(CatalogoService);
  private readonly toastService = inject(ToastService);
  private readonly estadoLista = inject(EstadoListaService);
  private readonly destroyRef = inject(DestroyRef);

  private readonly ciudades = toSignal(
    this.catalogoService.ciudades().pipe(catchError(() => of([]))),
    { initialValue: [] },
  );
  private readonly nombresCiudad = computed(
    () => new Map(this.ciudades().map((c) => [c.codigo_ciudad_pk, c.nombre])),
  );

  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly despachos = signal<Despacho[]>([]);
  readonly totalRecords = signal(0);
  readonly pageSize = signal(50);
  readonly first = signal(0);
  readonly filtrosVisibles = signal(true);

  readonly form = this.fb.group({
    codigo_vehiculo_fk: [''],
    numero: [null as number | null],
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

  nombreCiudad(codigo: string | null): string {
    if (!codigo) return '—';
    return this.nombresCiudad().get(codigo) ?? codigo;
  }

  /** Crear despachos depende de endpoints que fluor aún no expone. */
  nuevo(): void {
    this.toastService.info('Nuevo despacho', 'Disponible cuando se conecte el servicio.');
  }

  /** Al volver a la pantalla retoma los filtros y la página de esta sesión. */
  private restaurarOBuscar(): void {
    const estado = this.estadoLista.leer<ReturnType<typeof this.form.getRawValue>>('despachos');
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
    this.estadoLista.guardar('despachos', {
      filtros: this.form.getRawValue(),
      first: this.first(),
      rows: this.pageSize(),
    });

    this.loading.set(true);
    this.error.set(null);

    this.despachoService
      .listar({ page, size: this.pageSize(), ...this.form.getRawValue() })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.despachos.set(res.items);
          this.totalRecords.set(res.total);
          this.loading.set(false);
        },
        error: (err) => {
          this.error.set(extractErrorMessage(err, 'No se pudieron cargar los despachos.'));
          this.loading.set(false);
        },
      });
  }
}
