import { Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { ButtonModule } from 'primeng/button';
import { DatePickerModule } from 'primeng/datepicker';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import {
  BreadcrumbComponent,
  BreadcrumbItem,
  DATA_TABLE_PAGE_SIZE,
  DataTableCellDirective,
  DataTableComponent,
  DataTableRowActionEvent,
  ErrorAlertComponent,
  PageHeaderComponent,
} from '@semantica/ui';
import { ROUTE_PATHS, extractErrorMessage } from '@erp/core';
import {
  GUIAS_COLUMNS,
  GUIAS_ROW_ACTIONS,
  GUIA_ACCION_VER,
  GUIA_ESTADO_OPCIONES,
  GUIA_NUMERO_MAXIMO,
  GuiaEstadoFiltro,
  TRANSPORTE_MIGA_RAIZ,
} from '../../guia.constants';
import { Guia, GuiaCiudad, GuiaFila } from '../../guia.model';
import { GuiaService } from '../../guia.service';
import { getEstadoGuia, tieneNovedadAbierta } from '../../utils/guia-estado';

/** Administrador de guías: todas las de la empresa activa, de la más reciente a la más antigua. */
@Component({
  selector: 'app-guias-list',
  standalone: true,
  imports: [
    BreadcrumbComponent,
    DataTableCellDirective,
    DataTableComponent,
    ReactiveFormsModule,
    ButtonModule,
    DatePickerModule,
    InputNumberModule,
    InputTextModule,
    SelectModule,
    TagModule,
    TooltipModule,
    ErrorAlertComponent,
    PageHeaderComponent,
  ],
  templateUrl: './guias-list.component.html',
  styleUrl: './guias-list.component.scss',
})
export class GuiasListComponent implements OnInit {
  readonly breadcrumbItems: readonly BreadcrumbItem[] = [TRANSPORTE_MIGA_RAIZ, { label: 'Guías' }];

  private readonly fb = inject(FormBuilder);
  private readonly guiaService = inject(GuiaService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly router = inject(Router);

  readonly estadoOpciones = GUIA_ESTADO_OPCIONES;
  readonly numeroMaximo = GUIA_NUMERO_MAXIMO;
  readonly getEstado = getEstadoGuia;
  readonly tieneNovedad = tieneNovedadAbierta;

  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly guias = signal<Guia[]>([]);
  readonly totalRecords = signal(0);
  /** Página actual, empezando en cero. */
  readonly pagina = signal(0);

  private readonly ciudades = signal<GuiaCiudad[]>([]);
  private readonly nombresCiudad = computed(
    () => new Map(this.ciudades().map((c) => [c.codigo_ciudad_pk, c.nombre])),
  );

  readonly columnas = GUIAS_COLUMNS;
  readonly acciones = GUIAS_ROW_ACTIONS;

  readonly filas = computed<GuiaFila[]>(() =>
    this.guias().map((guia) => ({
      ...guia,
      origen_nombre: this.nombreCiudad(guia.codigo_ciudad_origen_fk),
      destino_nombre: this.nombreCiudad(guia.codigo_ciudad_destino_fk),
    })),
  );

  readonly form = this.fb.group({
    fecha_desde: [null as Date | null],
    fecha_hasta: [null as Date | null],
    estado: [null as GuiaEstadoFiltro | null],
    codigo_guia_pk: [null as number | null],
    documento_cliente: [''],
  });

  /** Petición en curso; se cancela si llega otra para que no pise a la más reciente. */
  private carga?: Subscription;

  ngOnInit(): void {
    this.cargarCiudades();
    this.buscar();
  }

  /** Aplica los filtros desde la primera página. */
  buscar(): void {
    this.irAPagina(0);
  }

  limpiar(): void {
    this.form.reset();
    this.buscar();
  }

  irAPagina(pagina: number): void {
    this.pagina.set(pagina);
    this.cargar(pagina + 1);
  }

  onAccion({ actionId, row }: DataTableRowActionEvent<GuiaFila>): void {
    if (actionId === GUIA_ACCION_VER) {
      void this.router.navigateByUrl(
        ROUTE_PATHS.dashboard.transporte.guiaDetalle(row.codigo_guia_pk),
      );
    }
  }

  /** Mientras no haya catálogo se muestra el código de la ciudad. */
  private nombreCiudad(codigo: string | null): string | null {
    return codigo ? (this.nombresCiudad().get(codigo) ?? codigo) : null;
  }

  private cargar(page: number): void {
    this.loading.set(true);
    this.error.set(null);

    this.carga?.unsubscribe();
    this.carga = this.guiaService
      .listar(page, DATA_TABLE_PAGE_SIZE, this.form.getRawValue())
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.guias.set(res.items);
          this.totalRecords.set(res.total);
          this.loading.set(false);
        },
        error: (err: unknown) => {
          this.error.set(extractErrorMessage(err, 'No se pudieron cargar las guías.'));
          this.loading.set(false);
        },
      });
  }

  /** Si el catálogo falla, el listado sigue funcionando con los códigos. */
  private cargarCiudades(): void {
    this.guiaService
      .ciudades()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({ next: (ciudades) => this.ciudades.set(ciudades), error: () => undefined });
  }
}
