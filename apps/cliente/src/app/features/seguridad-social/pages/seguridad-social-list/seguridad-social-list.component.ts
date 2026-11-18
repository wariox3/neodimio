import { Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DatePickerModule } from 'primeng/datepicker';
import { DialogModule } from 'primeng/dialog';
import { MessageModule } from 'primeng/message';
import { TableModule, TablePageEvent } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { extractErrorMessage } from '@semantica/core';
import {
  EmptyStateComponent,
  ErrorAlertComponent,
  LoadingSpinnerComponent,
  PageHeaderComponent,
} from '../../../../shared';
import { EstadoListaService } from '../../../../core';
import { SeguridadSocial } from '../../models/seguridad-social.model';
import {
  MAX_SEGURIDAD_SOCIAL,
  SeguridadSocialService,
} from '../../services/seguridad-social.service';
import { SeguridadSocialArchivosComponent } from '../../components/seguridad-social-archivos/seguridad-social-archivos.component';

/** Primer día del mes en curso: la planilla de un mes futuro aún no existe. */
function mesActual(): Date {
  const hoy = new Date();
  return new Date(hoy.getFullYear(), hoy.getMonth(), 1);
}

/**
 * Seguridad social de los empleados que prestan servicio al cliente
 * (`cliente_recursohumano_seguridadsocial_lista` de terbio): la planilla de un mes,
 * con los soportes que la empresa carga por empleado.
 */
@Component({
  selector: 'app-seguridad-social-list',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    ButtonModule,
    DatePickerModule,
    DialogModule,
    MessageModule,
    TableModule,
    TagModule,
    TooltipModule,
    PageHeaderComponent,
    LoadingSpinnerComponent,
    EmptyStateComponent,
    ErrorAlertComponent,
    SeguridadSocialArchivosComponent,
  ],
  templateUrl: './seguridad-social-list.component.html',
  styleUrl: '../../../../shared/styles/listado.scss',
})
export class SeguridadSocialListComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly seguridadSocialService = inject(SeguridadSocialService);
  private readonly estadoLista = inject(EstadoListaService);
  private readonly destroyRef = inject(DestroyRef);

  readonly maxConsulta = MAX_SEGURIDAD_SOCIAL;
  readonly mesMaximo = mesActual();
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly registros = signal<SeguridadSocial[]>([]);
  /** fluor tiene más empleados de los consultados para el mes. */
  readonly incompleto = signal(false);
  readonly pageSize = signal(50);
  readonly first = signal(0);
  readonly filtrosVisibles = signal(true);
  /** Empleado cuyos soportes se muestran en el diálogo. */
  readonly registroArchivos = signal<SeguridadSocial | null>(null);

  readonly form = this.fb.group({ mes: [mesActual() as Date | null] });

  private readonly mesElegido = toSignal(this.form.controls.mes.valueChanges, {
    initialValue: this.form.controls.mes.value,
  });
  readonly sinMes = computed(() => !this.mesElegido());

  ngOnInit(): void {
    const estado =
      this.estadoLista.leer<ReturnType<typeof this.form.getRawValue>>('seguridad-social');
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
    this.estadoLista.guardar('seguridad-social', {
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

    this.seguridadSocialService
      .delMes(mes.getFullYear(), mes.getMonth() + 1)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.registros.set(res.items);
          this.incompleto.set(res.incompleto);
          this.loading.set(false);
        },
        error: (err) => {
          this.error.set(extractErrorMessage(err, 'No se pudo cargar la seguridad social.'));
          this.loading.set(false);
        },
      });
  }
}
