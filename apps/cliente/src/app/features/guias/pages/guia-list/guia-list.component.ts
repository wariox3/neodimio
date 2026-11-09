import { Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DatePipe, DecimalPipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { DatePickerModule } from 'primeng/datepicker';
import { DialogModule } from 'primeng/dialog';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { MenuModule } from 'primeng/menu';
import { SelectModule } from 'primeng/select';
import { TableLazyLoadEvent, TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { ToastService, extractErrorMessage } from '@semantica/core';
import { TrimInputDirective } from '@semantica/ui';
import {
  ArchivosComponent,
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
import { Ciudad, OpcionCatalogo } from '../../../catalogos/models/catalogo.model';
import { CatalogoService } from '../../../catalogos/services/catalogo.service';
import { GuiaImprimirComponent } from '../../components/guia-imprimir/guia-imprimir.component';
import { Guia, GuiaEstadoFiltro } from '../../models/guia.model';
import { GuiaService } from '../../services/guia.service';
import { getEstadoGuia, getIndicadoresGuia, tieneNovedadAbierta } from '../../utils/guia-estado';

/** Tope de registros de una exportación. */
const MAX_EXPORTAR = 5000;

@Component({
  selector: 'app-guia-list',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    DatePipe,
    DecimalPipe,
    ButtonModule,
    DatePickerModule,
    DialogModule,
    InputNumberModule,
    InputTextModule,
    MenuModule,
    SelectModule,
    TableModule,
    TagModule,
    TooltipModule,
    TrimInputDirective,
    PageHeaderComponent,
    LoadingSpinnerComponent,
    EmptyStateComponent,
    ErrorAlertComponent,
    GuiaImprimirComponent,
    ArchivosComponent,
  ],
  templateUrl: './guia-list.component.html',
  styleUrls: ['../../../../shared/styles/listado.scss', './guia-list.component.scss'],
})
export class GuiaListComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly guiaService = inject(GuiaService);
  private readonly catalogoService = inject(CatalogoService);
  private readonly toastService = inject(ToastService);
  private readonly estadoLista = inject(EstadoListaService);
  private readonly destroyRef = inject(DestroyRef);

  readonly rutas = ROUTE_PATHS.dashboard.transporte;
  readonly getEstado = getEstadoGuia;
  readonly getIndicadores = getIndicadoresGuia;
  readonly tieneNovedad = tieneNovedadAbierta;

  readonly estadoOpciones: OpcionCatalogo<GuiaEstadoFiltro>[] = [
    { value: 'estado_ingreso', label: 'En bodega' },
    { value: 'estado_despachado', label: 'Despachadas' },
    { value: 'estado_entregado', label: 'Entregadas' },
    { value: 'estado_novedad', label: 'Con novedad' },
  ];

  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly guias = signal<Guia[]>([]);
  readonly totalRecords = signal(0);
  readonly pageSize = signal(50);
  readonly first = signal(0);
  readonly expandedRows = signal<Record<string, boolean>>({});
  readonly filtrosVisibles = signal(true);

  readonly tipos = signal<OpcionCatalogo[]>([]);
  readonly servicios = signal<OpcionCatalogo[]>([]);
  readonly operaciones = signal<OpcionCatalogo<number>[]>([]);
  readonly ciudades = signal<Ciudad[]>([]);
  private readonly nombresCiudad = computed(
    () => new Map(this.ciudades().map((c) => [c.codigo_ciudad_pk, c.nombre])),
  );

  readonly exportando = signal(false);
  /** Guía cuyos archivos se muestran en el diálogo. */
  readonly guiaArchivos = signal<Guia | null>(null);

  readonly form = this.fb.group({
    fecha_desde: [rangoHoy().desde],
    fecha_hasta: [rangoHoy().hasta],
    estado: [null as GuiaEstadoFiltro | null],
    codigo_guia_pk: [null as number | null],
    documento_cliente: [''],
    codigo_guia_tipo_fk: [null as string | null],
    codigo_servicio_fk: [null as string | null],
    codigo_ciudad_origen_fk: [null as string | null],
    codigo_ciudad_destino_fk: [null as string | null],
    codigo_despacho_fk: [null as number | null],
    codigo_tercero_operacion_fk: [null as number | null],
  });

  private readonly columnasCsv: ColumnaCsv<Guia>[] = [
    { titulo: 'Tipo', valor: (g) => g.codigo_guia_tipo_fk },
    { titulo: 'Guía', valor: (g) => g.codigo_guia_pk },
    { titulo: 'Fecha', valor: (g) => g.fecha_ingreso },
    { titulo: 'Documento', valor: (g) => g.documento_cliente },
    { titulo: 'Código origen', valor: (g) => g.codigo_ciudad_origen_fk },
    { titulo: 'Origen', valor: (g) => this.nombreCiudad(g.codigo_ciudad_origen_fk) },
    { titulo: 'Código destino', valor: (g) => g.codigo_ciudad_destino_fk },
    { titulo: 'Destino', valor: (g) => this.nombreCiudad(g.codigo_ciudad_destino_fk) },
    { titulo: 'Destinatario', valor: (g) => g.nombre_destinatario },
    { titulo: 'Unidades', valor: (g) => g.unidades },
    { titulo: 'Peso', valor: (g) => g.peso_facturado },
    { titulo: 'Volumen', valor: (g) => g.peso_volumen },
    { titulo: 'Declarado', valor: (g) => g.vr_declara },
    { titulo: 'Flete', valor: (g) => g.vr_flete },
    { titulo: 'Manejo', valor: (g) => g.vr_manejo },
    { titulo: 'Total', valor: (g) => (g.vr_flete ?? 0) + (g.vr_manejo ?? 0) },
    { titulo: 'Estado', valor: (g) => this.getEstado(g).label },
  ];

  readonly exportarItems: MenuItem[] = [
    { label: 'Excel', icon: 'pi pi-file-excel', command: () => this.exportarExcel() },
    { label: 'PDF', icon: 'pi pi-file-pdf', command: () => this.pendiente('Exportar a PDF') },
    { label: 'PDF 2', icon: 'pi pi-file-pdf', command: () => this.pendiente('Exportar a PDF 2') },
    { separator: true },
    {
      label: 'Descargar masivo',
      icon: 'pi pi-download',
      command: () => this.pendiente('Descarga masiva'),
    },
  ];

  ngOnInit(): void {
    this.cargarCatalogos();
    this.restaurarOBuscar();
  }

  /** Aplica los filtros desde la primera página. */
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

  /** Al volver a la pantalla retoma los filtros y la página de esta sesión. */
  private restaurarOBuscar(): void {
    const estado = this.estadoLista.leer<ReturnType<typeof this.form.getRawValue>>('guias');
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
    this.estadoLista.guardar('guias', {
      filtros: this.form.getRawValue(),
      first: this.first(),
      rows: this.pageSize(),
    });

    this.loading.set(true);
    this.error.set(null);
    this.expandedRows.set({});

    this.guiaService
      .listar({ page, size: this.pageSize(), ...this.form.getRawValue() })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.guias.set(res.items);
          this.totalRecords.set(res.total);
          this.loading.set(false);
        },
        error: (err) => {
          this.error.set(extractErrorMessage(err, 'No se pudieron cargar las guías.'));
          this.loading.set(false);
        },
      });
  }

  limpiar(): void {
    const { desde, hasta } = rangoHoy();
    this.form.reset({ fecha_desde: desde, fecha_hasta: hasta });
    this.buscar();
  }

  toggleFiltros(): void {
    this.filtrosVisibles.update((v) => !v);
  }

  nombreCiudad(codigo: string | null): string {
    if (!codigo) return '—';
    return this.nombresCiudad().get(codigo) ?? codigo;
  }

  /** Exporta todos los registros del filtro actual, no solo la página visible. */
  private exportarExcel(): void {
    this.exportando.set(true);
    this.guiaService
      .listar({
        page: 1,
        size: Math.min(this.totalRecords(), MAX_EXPORTAR),
        ...this.form.getRawValue(),
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          descargarCsv('guias', this.columnasCsv, res.items);
          this.exportando.set(false);
        },
        error: () => this.exportando.set(false),
      });
  }

  /** Si un catálogo falla, su filtro queda vacío y la lista sigue funcionando. */
  private cargarCatalogos(): void {
    this.catalogoService
      .ciudades()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({ next: (v) => this.ciudades.set(v), error: () => undefined });
    this.catalogoService
      .guiaTipos()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (v) =>
          this.tipos.set(
            v.map((t) => ({
              value: t.codigo_guia_tipo_pk,
              label: t.nombre ?? t.codigo_guia_tipo_pk,
            })),
          ),
        error: () => undefined,
      });
    this.catalogoService
      .servicios()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (v) =>
          this.servicios.set(
            v.map((t) => ({
              value: t.codigo_servicio_pk,
              label: t.nombre ?? t.codigo_servicio_pk,
            })),
          ),
        error: () => undefined,
      });
    this.catalogoService
      .operacionesTercero()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (v) =>
          this.operaciones.set(
            v.map((o) => ({
              value: o.codigo_tercero_operacion_pk,
              label: o.nombre ?? o.codigo ?? String(o.codigo_tercero_operacion_pk),
            })),
          ),
        error: () => undefined,
      });
  }

  /** Acciones que dependen de endpoints que fluor aún no expone. */
  private pendiente(accion: string): void {
    this.toastService.info(accion, 'Disponible cuando se conecte el servicio de guías.');
  }
}
