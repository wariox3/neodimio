import { Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DatePipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { DatePickerModule } from 'primeng/datepicker';
import { InputNumberModule } from 'primeng/inputnumber';
import { SelectModule } from 'primeng/select';
import { TableLazyLoadEvent, TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { extractErrorMessage } from '@semantica/core';
import {
  EmptyStateComponent,
  ErrorAlertComponent,
  LoadingSpinnerComponent,
  PageHeaderComponent,
} from '../../../../shared';
import {
  ColumnaCsv,
  descargarCsv,
  rangoHoy,
  ROUTE_PATHS,
  EstadoListaService,
} from '../../../../core';
import { OpcionCatalogo } from '../../../catalogos/models/catalogo.model';
import { Novedad, NovedadListaParams } from '../../models/novedad.model';
import { NovedadService } from '../../services/novedad.service';

/** Tope de registros de una exportación. */
const MAX_EXPORTAR = 5000;

const COLUMNAS_CSV: ColumnaCsv<Novedad>[] = [
  { titulo: 'ID', valor: (n) => n.codigo_novedad_pk },
  { titulo: 'Guía', valor: (n) => n.codigo_guia_fk },
  { titulo: 'Tipo', valor: (n) => n.codigo_novedad_tipo_fk },
  { titulo: 'Fecha', valor: (n) => n.fecha },
  { titulo: 'Descripción', valor: (n) => n.descripcion },
  { titulo: 'Atendido', valor: (n) => !!n.estado_atendido },
  { titulo: 'Solucionado', valor: (n) => !!n.estado_solucion },
  { titulo: 'Solución', valor: (n) => n.solucion },
  { titulo: 'Fecha solución', valor: (n) => (n.estado_solucion ? n.fecha_solucion : null) },
];

/**
 * Lista de novedades, equivalente a `cliente_transporte_novedad_lista` de terbio:
 * por defecto muestra las de hoy sin solucionar. El filtro por documento de terbio
 * queda pendiente porque `/tte/novedad/lista` aún no lo admite ni devuelve ese dato.
 */
@Component({
  selector: 'app-novedad-list',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    DatePipe,
    ButtonModule,
    DatePickerModule,
    InputNumberModule,
    SelectModule,
    TableModule,
    TagModule,
    PageHeaderComponent,
    LoadingSpinnerComponent,
    EmptyStateComponent,
    ErrorAlertComponent,
  ],
  templateUrl: './novedad-list.component.html',
  styleUrl: '../../../../shared/styles/listado.scss',
})
export class NovedadListComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly novedadService = inject(NovedadService);
  private readonly estadoLista = inject(EstadoListaService);
  private readonly destroyRef = inject(DestroyRef);

  readonly rutas = ROUTE_PATHS.dashboard.transporte;

  readonly opcionesSiNo: OpcionCatalogo<boolean>[] = [
    { value: true, label: 'Sí' },
    { value: false, label: 'No' },
  ];

  readonly loading = signal(true);
  readonly exportando = signal(false);
  readonly error = signal<string | null>(null);
  readonly novedades = signal<Novedad[]>([]);
  readonly totalRecords = signal(0);
  readonly pageSize = signal(50);
  readonly first = signal(0);
  readonly filtrosVisibles = signal(true);

  readonly form = this.fb.group({
    codigo_guia_fk: [null as number | null],
    estado_atendido: [null as boolean | null],
    estado_solucion: [false as boolean | null],
    fecha_desde: [rangoHoy().desde],
    fecha_hasta: [rangoHoy().hasta],
  });

  ngOnInit(): void {
    this.restaurarOBuscar();
  }

  buscar(): void {
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
    const { desde, hasta } = rangoHoy();
    this.form.reset({ estado_solucion: false, fecha_desde: desde, fecha_hasta: hasta });
    this.buscar();
  }

  toggleFiltros(): void {
    this.filtrosVisibles.update((v) => !v);
  }

  /** Exporta todos los registros del filtro actual, no solo la página visible. */
  exportar(): void {
    this.exportando.set(true);
    this.novedadService
      .listar(this.parametros(1, Math.min(this.totalRecords(), MAX_EXPORTAR)))
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          descargarCsv('novedades', COLUMNAS_CSV, res.items);
          this.exportando.set(false);
        },
        error: () => this.exportando.set(false),
      });
  }

  /** Al volver a la pantalla retoma los filtros y la página de esta sesión. */
  private restaurarOBuscar(): void {
    const estado = this.estadoLista.leer<ReturnType<typeof this.form.getRawValue>>('novedades');
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
    this.estadoLista.guardar('novedades', {
      filtros: this.form.getRawValue(),
      first: this.first(),
      rows: this.pageSize(),
    });

    this.loading.set(true);
    this.error.set(null);

    this.novedadService
      .listar(this.parametros(page, this.pageSize()))
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.novedades.set(res.items);
          this.totalRecords.set(res.total);
          this.loading.set(false);
        },
        error: (err) => {
          this.error.set(extractErrorMessage(err, 'No se pudieron cargar las novedades.'));
          this.loading.set(false);
        },
      });
  }

  private parametros(page: number, size: number): NovedadListaParams {
    return { page, size, ...this.form.getRawValue() };
  }
}
