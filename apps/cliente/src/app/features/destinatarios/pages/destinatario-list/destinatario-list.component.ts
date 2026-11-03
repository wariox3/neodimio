import { Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TableLazyLoadEvent, TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { ToastService, extractErrorMessage, trimFormValues } from '@semantica/core';
import { TrimInputDirective } from '@semantica/ui';
import {
  EmptyStateComponent,
  ErrorAlertComponent,
  LoadingSpinnerComponent,
  PageHeaderComponent,
} from '../../../../shared';
import { ColumnaCsv, descargarCsv, ROUTE_PATHS, EstadoListaService } from '../../../../core';
import { Destinatario } from '../../models/destinatario.model';
import { DestinatarioService } from '../../services/destinatario.service';

const COLUMNAS_CSV: ColumnaCsv<Destinatario>[] = [
  { titulo: 'ID', valor: (d) => d.codigo_destinatario_pk },
  { titulo: 'Tipo', valor: (d) => d.codigo_identificacion_fk },
  { titulo: 'Identificación', valor: (d) => d.numero_identificacion },
  { titulo: 'Nombre', valor: (d) => d.nombre_corto },
  { titulo: 'Dirección', valor: (d) => d.direccion },
  { titulo: 'Teléfono', valor: (d) => d.telefono },
  { titulo: 'Código ciudad', valor: (d) => d.codigo_ciudad_fk },
  { titulo: 'Ciudad', valor: (d) => d.ciudad_nombre },
];

/** Lista de destinatarios, equivalente a `cliente_transporte_destinatario_lista` de terbio. */
@Component({
  selector: 'app-destinatario-list',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    ButtonModule,
    InputTextModule,
    TableModule,
    TagModule,
    TooltipModule,
    TrimInputDirective,
    PageHeaderComponent,
    LoadingSpinnerComponent,
    EmptyStateComponent,
    ErrorAlertComponent,
  ],
  templateUrl: './destinatario-list.component.html',
  styleUrl: '../../../../shared/styles/listado.scss',
})
export class DestinatarioListComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly destinatarioService = inject(DestinatarioService);
  private readonly toastService = inject(ToastService);
  private readonly estadoLista = inject(EstadoListaService);
  private readonly destroyRef = inject(DestroyRef);

  readonly rutas = ROUTE_PATHS.dashboard.transporte;

  readonly loading = signal(true);
  readonly exportando = signal(false);
  readonly error = signal<string | null>(null);
  readonly destinatarios = signal<Destinatario[]>([]);
  readonly totalRecords = signal(0);
  readonly pageSize = signal(50);
  readonly first = signal(0);
  readonly filtrosVisibles = signal(true);

  readonly form = this.fb.nonNullable.group({
    nombre_corto: [''],
    numero_identificacion: [''],
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

  /** Exporta todos los registros del filtro actual, no solo la página visible. */
  exportar(): void {
    this.exportando.set(true);
    this.destinatarioService
      .listarTodos(this.form.getRawValue())
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (filas) => {
          descargarCsv('destinatarios', COLUMNAS_CSV, filas);
          this.exportando.set(false);
        },
        error: () => this.exportando.set(false),
      });
  }

  /** La importación de terbio lee un Excel y valida contra endpoints que fluor no expone. */
  importar(): void {
    this.toastService.info('Importar', 'Disponible cuando se conecte el servicio.');
  }

  /** Al volver a la pantalla retoma los filtros y la página de esta sesión. */
  private restaurarOBuscar(): void {
    const estado = this.estadoLista.leer<ReturnType<typeof this.form.getRawValue>>('destinatarios');
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
    this.estadoLista.guardar('destinatarios', {
      filtros: this.form.getRawValue(),
      first: this.first(),
      rows: this.pageSize(),
    });

    this.loading.set(true);
    this.error.set(null);

    this.destinatarioService
      .listar({ page, size: this.pageSize(), ...this.form.getRawValue() })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.destinatarios.set(res.items);
          this.totalRecords.set(res.total);
          this.loading.set(false);
        },
        error: (err) => {
          this.error.set(extractErrorMessage(err, 'No se pudieron cargar los destinatarios.'));
          this.loading.set(false);
        },
      });
  }
}
