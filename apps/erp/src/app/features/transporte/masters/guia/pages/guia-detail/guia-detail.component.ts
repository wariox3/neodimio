import { DatePipe, NgTemplateOutlet } from '@angular/common';
import { Component, DestroyRef, OnInit, computed, inject, input, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import {
  BreadcrumbComponent,
  BreadcrumbItem,
  DetailSectionComponent,
  ErrorAlertComponent,
  LoadingSpinnerComponent,
} from '@semantica/ui';
import { ROUTE_PATHS, extractErrorMessage } from '@erp/core';
import { TRANSPORTE_MIGA_RAIZ } from '../../guia.constants';
import { GuiaDetalle } from '../../guia.model';
import { GuiaService } from '../../guia.service';
import { fichaGuia, seguimientoGuia, ultimoPasoCompletado } from '../../guia.format';
import { getEstadoGuia, getIndicadoresGuia } from '../../utils/guia-estado';

/** Ficha de solo lectura de una guía. */
@Component({
  selector: 'app-guia-detail',
  standalone: true,
  imports: [
    DatePipe,
    NgTemplateOutlet,
    RouterLink,
    ButtonModule,
    BreadcrumbComponent,
    DetailSectionComponent,
    ErrorAlertComponent,
    LoadingSpinnerComponent,
  ],
  templateUrl: './guia-detail.component.html',
  styleUrl: './guia-detail.component.scss',
})
export class GuiaDetailComponent implements OnInit {
  private readonly guiaService = inject(GuiaService);
  private readonly destroyRef = inject(DestroyRef);

  /** Id de la guía, desde el parámetro `:id` de la ruta. */
  readonly id = input.required<string>();

  readonly listaRoute = ROUTE_PATHS.dashboard.transporte.guias;

  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly guia = signal<GuiaDetalle | null>(null);

  readonly titulo = computed(() => {
    const guia = this.guia();
    return guia ? `Guía ${guia.codigo_guia_pk}` : 'Guía';
  });

  readonly breadcrumbItems = computed<readonly BreadcrumbItem[]>(() => [
    TRANSPORTE_MIGA_RAIZ,
    { label: 'Guías', routerLink: this.listaRoute },
    { label: this.titulo() },
  ]);

  readonly estado = computed(() => {
    const guia = this.guia();
    return guia ? getEstadoGuia(guia) : null;
  });

  readonly ficha = computed(() => {
    const guia = this.guia();
    return guia ? fichaGuia(guia) : null;
  });

  readonly indicadores = computed(() => {
    const guia = this.guia();
    return guia ? getIndicadoresGuia(guia) : [];
  });

  readonly seguimiento = computed(() => {
    const guia = this.guia();
    return guia ? seguimientoGuia(guia) : [];
  });

  /** Posición del último movimiento real: hasta ahí se pinta el trayecto. */
  readonly pasoActual = computed(() => ultimoPasoCompletado(this.seguimiento()));

  readonly ultimoMovimiento = computed(() => this.seguimiento()[this.pasoActual()] ?? null);

  readonly verTodasLasCondiciones = signal(false);

  /** Por defecto solo las condiciones que aplican: las inactivas son ruido al escanear. */
  readonly condicionesVisibles = computed(() =>
    this.verTodasLasCondiciones()
      ? this.indicadores()
      : this.indicadores().filter((indicador) => indicador.activo),
  );

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    const id = Number(this.id());
    if (!Number.isInteger(id)) {
      this.error.set('La guía no existe.');
      this.loading.set(false);
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    this.guiaService
      .obtener(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (guia) => {
          this.guia.set(guia);
          this.loading.set(false);
        },
        error: (err: unknown) => {
          this.error.set(extractErrorMessage(err, 'No se pudo cargar la guía.'));
          this.loading.set(false);
        },
      });
  }
}
