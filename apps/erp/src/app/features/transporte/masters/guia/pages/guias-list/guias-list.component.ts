import { DatePipe, DecimalPipe } from '@angular/common';
import { Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { ButtonModule } from 'primeng/button';
import { DatePickerModule } from 'primeng/datepicker';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TableLazyLoadEvent, TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import {
  BreadcrumbComponent,
  BreadcrumbItem,
  EmptyStateComponent,
  ErrorAlertComponent,
  LoadingSpinnerComponent,
  PageHeaderComponent,
} from '@semantica/ui';
import { ROUTE_PATHS, extractErrorMessage } from '../../../../../../core';
import { GUIA_ESTADO_OPCIONES, GUIA_NUMERO_MAXIMO, GuiaEstadoFiltro } from '../../guia.constants';
import { Guia, GuiaCiudad } from '../../guia.model';
import { GuiaService } from '../../guia.service';
import { getEstadoGuia, tieneNovedadAbierta } from '../../utils/guia-estado';

/** Administrador de guías: todas las de la empresa activa, de la más reciente a la más antigua. */
@Component({
  selector: 'app-guias-list',
  standalone: true,
  imports: [
    BreadcrumbComponent,
    DatePipe,
    DecimalPipe,
    ReactiveFormsModule,
    RouterLink,
    ButtonModule,
    DatePickerModule,
    InputNumberModule,
    InputTextModule,
    SelectModule,
    TableModule,
    TagModule,
    TooltipModule,
    EmptyStateComponent,
    ErrorAlertComponent,
    LoadingSpinnerComponent,
    PageHeaderComponent,
  ],
  templateUrl: './guias-list.component.html',
  styleUrl: './guias-list.component.scss',
})
export class GuiasListComponent implements OnInit {
  readonly breadcrumbItems: readonly BreadcrumbItem[] = [
    { label: 'Transporte', routerLink: ROUTE_PATHS.dashboard.transporte.inicio },
    { label: 'Guías' },
  ];

  private readonly fb = inject(FormBuilder);
  private readonly guiaService = inject(GuiaService);
  private readonly destroyRef = inject(DestroyRef);

  readonly detalleRoute = ROUTE_PATHS.dashboard.transporte.guiaDetalle;
  readonly estadoOpciones = GUIA_ESTADO_OPCIONES;
  readonly numeroMaximo = GUIA_NUMERO_MAXIMO;
  readonly getEstado = getEstadoGuia;
  readonly tieneNovedad = tieneNovedadAbierta;

  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly guias = signal<Guia[]>([]);
  readonly totalRecords = signal(0);
  readonly rows = signal(25);
  /** Índice de la primera fila; permite resetear el paginador a la página 1. */
  readonly first = signal(0);

  private readonly ciudades = signal<GuiaCiudad[]>([]);
  private readonly nombresCiudad = computed(
    () => new Map(this.ciudades().map((c) => [c.codigo_ciudad_pk, c.nombre])),
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
    this.first.set(0);
    this.cargar(1);
  }

  limpiar(): void {
    this.form.reset();
    this.buscar();
  }

  onLazyLoad(event: TableLazyLoadEvent): void {
    const first = event.first ?? 0;
    const rows = event.rows ?? this.rows();
    this.first.set(first);
    this.rows.set(rows);
    this.cargar(Math.floor(first / rows) + 1);
  }

  /** Nombre de la ciudad; mientras no haya catálogo se muestra su código. */
  nombreCiudad(codigo: string | null): string {
    if (!codigo) return '—';
    return this.nombresCiudad().get(codigo) ?? codigo;
  }

  private cargar(page: number): void {
    this.loading.set(true);
    this.error.set(null);

    this.carga?.unsubscribe();
    this.carga = this.guiaService
      .listar(page, this.rows(), this.form.getRawValue())
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
