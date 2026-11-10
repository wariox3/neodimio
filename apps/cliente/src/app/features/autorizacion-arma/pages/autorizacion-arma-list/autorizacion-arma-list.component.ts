import { Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Observable } from 'rxjs';
import { ButtonModule } from 'primeng/button';
import { MessageModule } from 'primeng/message';
import { TableModule, TablePageEvent } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { ToastService, extractErrorMessage } from '@semantica/core';
import {
  EmptyStateComponent,
  ErrorAlertComponent,
  LoadingSpinnerComponent,
  PageHeaderComponent,
} from '../../../../shared';
import { EstadoListaService, aFechaApi } from '../../../../core';
import { AutorizacionArma, estadoFecha } from '../../models/autorizacion-arma.model';
import {
  AutorizacionArmaService,
  MAX_AUTORIZACIONES,
} from '../../services/autorizacion-arma.service';

/** Clave con la que se conserva la página de la tabla en la sesión. */
const ESTADO_LISTA = 'autorizacion-arma';

/** Qué se está imprimiendo: un empleado por su id, o todos los vigentes. */
type Impresion = number | 'vigentes';

/**
 * Autorización para portar armas del personal que presta servicio al cliente
 * (`cliente_recursohumano_autorizacionarma_lista` de terbio): las fechas de acreditación,
 * polígono y psicofísico de cada empleado y la impresión de su autorización.
 */
@Component({
  selector: 'app-autorizacion-arma-list',
  standalone: true,
  imports: [
    DatePipe,
    ButtonModule,
    MessageModule,
    TableModule,
    TagModule,
    TooltipModule,
    PageHeaderComponent,
    LoadingSpinnerComponent,
    EmptyStateComponent,
    ErrorAlertComponent,
  ],
  templateUrl: './autorizacion-arma-list.component.html',
  styleUrls: ['../../../../shared/styles/listado.scss', './autorizacion-arma-list.component.scss'],
})
export class AutorizacionArmaListComponent implements OnInit {
  private readonly autorizacionService = inject(AutorizacionArmaService);
  private readonly toastService = inject(ToastService);
  private readonly estadoLista = inject(EstadoListaService);
  private readonly destroyRef = inject(DestroyRef);

  readonly maxConsulta = MAX_AUTORIZACIONES;
  readonly hoy = aFechaApi(new Date());
  readonly estadoFecha = estadoFecha;
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly empleados = signal<AutorizacionArma[]>([]);
  /** fluor tiene más empleados del cliente de los consultados. */
  readonly incompleto = signal(false);
  readonly pageSize = signal(50);
  readonly first = signal(0);
  /** Impresión en curso, para mostrar su botón cargando. */
  readonly imprimiendo = signal<Impresion | null>(null);

  readonly vigentes = computed(() => this.empleados().filter((e) => e.vigente).length);

  ngOnInit(): void {
    const estado = this.estadoLista.leer<Record<string, never>>(ESTADO_LISTA);
    if (estado) {
      this.first.set(estado.first);
      this.pageSize.set(estado.rows);
    }
    this.cargar();
  }

  /** Vuelve a consultar desde la primera página (botón de reintentar). */
  recargar(): void {
    this.first.set(0);
    this.guardarEstado();
    this.cargar();
  }

  onPage(event: TablePageEvent): void {
    this.first.set(event.first);
    this.pageSize.set(event.rows);
    this.guardarEstado();
  }

  imprimir(empleado: AutorizacionArma): void {
    this.abrirPdf(
      empleado.codigo_empleado_pk,
      this.autorizacionService.imprimir(empleado.codigo_empleado_pk),
      `autorizacion_arma_${empleado.codigo_empleado_pk}.pdf`,
    );
  }

  imprimirVigentes(): void {
    this.abrirPdf('vigentes', this.autorizacionService.imprimirVigentes(), 'autorizacion_arma.pdf');
  }

  private abrirPdf(impresion: Impresion, pdf$: Observable<Blob>, nombre: string): void {
    // La pestaña se abre ya, dentro del clic: abrirla al volver la petición la bloquearía
    // el navegador. Si aun así la bloquea, el PDF se descarga.
    const pestana = window.open('', '_blank');
    this.imprimiendo.set(impresion);

    pdf$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (pdf) => {
        const url = URL.createObjectURL(pdf);
        if (pestana) {
          pestana.location.href = url;
        } else {
          const enlace = document.createElement('a');
          enlace.href = url;
          enlace.download = nombre;
          enlace.click();
        }
        setTimeout(() => URL.revokeObjectURL(url), 60_000);
        this.imprimiendo.set(null);
      },
      error: (err: HttpErrorResponse) => {
        pestana?.close();
        this.imprimiendo.set(null);
        // El cuerpo del error llega como Blob, así que el mensaje se arma aquí.
        // El resto de estados ya los avisa el interceptor.
        const mensaje = this.mensajeError(impresion, err.status);
        if (mensaje) this.toastService.error('No se pudo imprimir', mensaje);
      },
    });
  }

  private mensajeError(impresion: Impresion, status: number): string | null {
    if (status === 409)
      return 'La empresa no tiene configurado el formato de autorización de armas.';
    if (status !== 404) return null;
    return impresion === 'vigentes'
      ? 'Ningún empleado tiene la acreditación, el polígono y el psicofísico vigentes.'
      : 'No se encontró el empleado.';
  }

  private guardarEstado(): void {
    this.estadoLista.guardar(ESTADO_LISTA, {
      filtros: {},
      first: this.first(),
      rows: this.pageSize(),
    });
  }

  private cargar(): void {
    this.loading.set(true);
    this.error.set(null);

    this.autorizacionService
      .listar()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.empleados.set(res.items);
          this.incompleto.set(res.incompleto);
          this.loading.set(false);
        },
        error: (err) => {
          this.error.set(extractErrorMessage(err, 'No se pudo cargar el personal.'));
          this.loading.set(false);
        },
      });
  }
}
