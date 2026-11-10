import { Component, DestroyRef, OnInit, computed, inject, input, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { AvatarModule } from 'primeng/avatar';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { ProgressBarModule } from 'primeng/progressbar';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { extractErrorMessage } from '@semantica/core';
import {
  EmptyStateComponent,
  ErrorAlertComponent,
  LoadingSpinnerComponent,
  PageHeaderComponent,
} from '../../../../shared';
import { aFechaApi, ROUTE_PATHS } from '../../../../core';
import {
  EstadoCompromiso,
  VisitaCompromiso,
  VisitaDetalle,
  estadoCompromiso,
  iniciales,
} from '../../models/visita.model';
import { VisitaService } from '../../services/visita.service';
import { VisitaArchivosComponent } from '../../components/visita-archivos/visita-archivos.component';
import { VisitaImprimirComponent } from '../../components/visita-imprimir/visita-imprimir.component';

/** Cómo se muestra cada estado de un compromiso. */
const ESTADOS: Record<
  EstadoCompromiso,
  { label: string; icono: string; severity: 'success' | 'warn' | 'danger' }
> = {
  atendido: { label: 'Atendido', icono: 'pi pi-check-circle', severity: 'success' },
  pendiente: { label: 'Pendiente', icono: 'pi pi-circle', severity: 'warn' },
  vencido: { label: 'Vencido', icono: 'pi pi-exclamation-circle', severity: 'danger' },
};

/** Compromiso listo para la vista, con su estado ya resuelto. */
interface CompromisoVista extends VisitaCompromiso {
  estado: EstadoCompromiso;
}

/** Compromisos de un mismo responsable. */
interface GrupoCompromisos {
  titulo: string;
  icono: string;
  items: CompromisoVista[];
}

/**
 * Detalle de una visita (`cliente_crm_visita_detalle` de terbio): a la izquierda los
 * reportes de quien la atendió y los compromisos acordados, separados por responsable;
 * a la derecha el resumen de la visita y el avance de los compromisos. Desde la cabecera se
 * imprime el formato y se consultan los archivos que la empresa cargó a la visita.
 */
@Component({
  selector: 'app-visita-detalle',
  standalone: true,
  imports: [
    RouterLink,
    DatePipe,
    AvatarModule,
    ButtonModule,
    DialogModule,
    ProgressBarModule,
    TagModule,
    TooltipModule,
    PageHeaderComponent,
    LoadingSpinnerComponent,
    ErrorAlertComponent,
    EmptyStateComponent,
    VisitaImprimirComponent,
    VisitaArchivosComponent,
  ],
  templateUrl: './visita-detalle.component.html',
  styleUrl: './visita-detalle.component.scss',
})
export class VisitaDetalleComponent implements OnInit {
  private readonly visitaService = inject(VisitaService);
  private readonly destroyRef = inject(DestroyRef);

  /** Id de la visita, desde el parámetro `:id` de la ruta. */
  readonly id = input.required<string>();

  readonly listaRoute = ROUTE_PATHS.dashboard.crm.visitas;
  readonly estados = ESTADOS;
  readonly iniciales = iniciales;

  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly visita = signal<VisitaDetalle | null>(null);
  readonly archivosVisibles = signal(false);

  private readonly compromisos = computed<CompromisoVista[]>(() => {
    const hoy = aFechaApi(new Date());
    return (this.visita()?.compromisos ?? []).map((c) => ({
      ...c,
      estado: estadoCompromiso(c, hoy),
    }));
  });

  /** Primero los del cliente, que son los que él debe atender; los grupos vacíos no se muestran. */
  readonly grupos = computed<GrupoCompromisos[]>(() =>
    [
      {
        titulo: 'Tus compromisos',
        icono: 'pi pi-user',
        items: this.compromisos().filter((c) => c.cliente),
      },
      {
        titulo: 'De la empresa',
        icono: 'pi pi-building',
        items: this.compromisos().filter((c) => !c.cliente),
      },
    ].filter((g) => g.items.length > 0),
  );

  readonly totalCompromisos = computed(() => this.compromisos().length);
  readonly atendidos = computed(
    () => this.compromisos().filter((c) => c.estado === 'atendido').length,
  );
  readonly vencidos = computed(
    () => this.compromisos().filter((c) => c.estado === 'vencido').length,
  );
  readonly pendientes = computed(
    () => this.compromisos().filter((c) => c.estado === 'pendiente').length,
  );
  /** Porcentaje de compromisos atendidos, para la barra de avance. */
  readonly avance = computed(() =>
    this.totalCompromisos() ? Math.round((this.atendidos() / this.totalCompromisos()) * 100) : 0,
  );

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.loading.set(true);
    this.error.set(null);

    this.visitaService
      .detalle(Number(this.id()))
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (visita) => {
          this.visita.set(visita);
          this.loading.set(false);
        },
        error: (err) => {
          this.error.set(extractErrorMessage(err, 'No se pudo cargar la visita.'));
          this.loading.set(false);
        },
      });
  }
}
