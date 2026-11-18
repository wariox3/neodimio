import { HttpErrorResponse } from '@angular/common/http';
import {
  Component,
  DestroyRef,
  effect,
  inject,
  input,
  model,
  output,
  signal,
  untracked,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { DatePickerModule } from 'primeng/datepicker';
import { DialogModule } from 'primeng/dialog';
import { InputNumberModule } from 'primeng/inputnumber';
import { MessageModule } from 'primeng/message';
import { SelectModule } from 'primeng/select';
import { extractErrorMessage, ToastService } from '@semantica/core';
import { aFechaApi } from '../../../../core';
import {
  CotizacionServicio,
  DIAS_SERVICIO,
  DiaServicio,
  MODALIDADES,
  ModalidadServicio,
} from '../../models/cotizacion.model';
import { CotizacionService } from '../../services/cotizacion.service';

/** Cantidad máxima de servicios por línea que acepta fluor. */
const CANTIDAD_MAX = 1000;

/** Medianoche de hoy: 00:00 a 00:00 es un servicio de 24 horas, el valor inicial de terbio. */
function medianoche(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

/** `HH:mm` de la hora elegida. */
function aHoraApi(fecha: Date): string {
  return `${String(fecha.getHours()).padStart(2, '0')}:${String(fecha.getMinutes()).padStart(2, '0')}`;
}

/** La fecha hasta no puede ser anterior a la fecha desde. */
function validarFechas(group: AbstractControl): ValidationErrors | null {
  const desde = group.get('fecha_desde')?.value as Date | null;
  const hasta = group.get('fecha_hasta')?.value as Date | null;
  if (!desde || !hasta) return null;
  return aFechaApi(hasta) < aFechaApi(desde) ? { rangoFechas: true } : null;
}

/** Al menos un día de la semana o los festivos. */
function validarDias(group: AbstractControl): ValidationErrors | null {
  const dias = group.value as Record<DiaServicio, boolean>;
  return Object.values(dias).some(Boolean) ? null : { sinDias: true };
}

/**
 * Agrega un servicio a la cotización (`cliente_crm_contratacion_detalle_nuevo` de terbio,
 * que se abría en otra ventana). fluor usa el ítem configurado al usuario, calcula las
 * horas diurnas y nocturnas y reliquida la cotización.
 */
@Component({
  selector: 'app-servicio-nuevo',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    ButtonModule,
    CheckboxModule,
    DatePickerModule,
    DialogModule,
    InputNumberModule,
    MessageModule,
    SelectModule,
  ],
  templateUrl: './servicio-nuevo.component.html',
  styleUrl: './servicio-nuevo.component.scss',
})
export class ServicioNuevoComponent {
  private readonly fb = inject(FormBuilder);
  private readonly cotizacionService = inject(CotizacionService);
  private readonly toastService = inject(ToastService);
  private readonly destroyRef = inject(DestroyRef);

  readonly cotizacionId = input.required<number>();
  readonly visible = model(false);
  readonly agregado = output<CotizacionServicio>();

  readonly modalidades = MODALIDADES;
  readonly dias = DIAS_SERVICIO;
  readonly cantidadMax = CANTIDAD_MAX;
  readonly guardando = signal(false);
  readonly errorMessage = signal<string | null>(null);

  readonly form = this.fb.group(
    {
      codigo_modalidad_fk: this.fb.nonNullable.control<ModalidadServicio>(
        'SAR',
        Validators.required,
      ),
      cantidad: this.fb.control<number | null>(1, [
        Validators.required,
        Validators.min(1),
        Validators.max(CANTIDAD_MAX),
      ]),
      fecha_desde: this.fb.control<Date | null>(new Date(), Validators.required),
      fecha_hasta: this.fb.control<Date | null>(new Date(), Validators.required),
      hora_desde: this.fb.control<Date | null>(medianoche(), Validators.required),
      hora_hasta: this.fb.control<Date | null>(medianoche(), Validators.required),
      dias: this.fb.nonNullable.group(
        Object.fromEntries(DIAS_SERVICIO.map((d) => [d.campo, true])) as Record<
          DiaServicio,
          boolean
        >,
        { validators: validarDias },
      ),
    },
    { validators: validarFechas },
  );

  constructor() {
    // Cada apertura empieza con los valores de terbio: hoy, 24 horas y todos los días.
    effect(() => {
      if (this.visible()) {
        untracked(() => {
          this.form.reset({
            codigo_modalidad_fk: 'SAR',
            cantidad: 1,
            fecha_desde: new Date(),
            fecha_hasta: new Date(),
            hora_desde: medianoche(),
            hora_hasta: medianoche(),
            dias: Object.fromEntries(DIAS_SERVICIO.map((d) => [d.campo, true])),
          });
          this.errorMessage.set(null);
        });
      }
    });
  }

  /** Mensaje de error de un control, o `null` si es válido o no se ha tocado. */
  errorDe(
    nombre:
      | 'codigo_modalidad_fk'
      | 'cantidad'
      | 'fecha_desde'
      | 'fecha_hasta'
      | 'hora_desde'
      | 'hora_hasta',
  ): string | null {
    const control = this.form.controls[nombre];
    if (!control.touched) return null;
    if (nombre === 'fecha_hasta' && control.valid && this.form.hasError('rangoFechas')) {
      return 'No puede ser anterior a la fecha desde.';
    }
    if (control.valid) return null;
    if (control.hasError('required')) return 'Este campo es obligatorio.';
    if (control.hasError('min')) return 'Debe ser al menos 1.';
    if (control.hasError('max')) return `Máximo ${CANTIDAD_MAX}.`;
    return 'Valor inválido.';
  }

  get errorDias(): string | null {
    const dias = this.form.controls.dias;
    return dias.touched && dias.hasError('sinDias')
      ? 'Selecciona al menos un día del servicio.'
      : null;
  }

  guardar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.errorMessage.set('Revisa los campos marcados antes de guardar.');
      return;
    }

    const v = this.form.getRawValue();
    // Los validadores `required` ya garantizan estos valores; se comprueban para el tipado.
    const { cantidad, fecha_desde, fecha_hasta, hora_desde, hora_hasta } = v;
    if (cantidad === null || !fecha_desde || !fecha_hasta || !hora_desde || !hora_hasta) return;

    this.errorMessage.set(null);
    this.guardando.set(true);
    this.cotizacionService
      .agregarServicio(this.cotizacionId(), {
        codigo_modalidad_fk: v.codigo_modalidad_fk,
        cantidad,
        fecha_desde: aFechaApi(fecha_desde),
        fecha_hasta: aFechaApi(fecha_hasta),
        hora_desde: aHoraApi(hora_desde),
        hora_hasta: aHoraApi(hora_hasta),
        ...v.dias,
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (servicio) => {
          this.guardando.set(false);
          this.toastService.success('Servicio agregado', 'La cotización se volvió a liquidar.');
          this.agregado.emit(servicio);
          this.visible.set(false);
        },
        error: (err: unknown) => {
          this.guardando.set(false);
          // 400 trae el motivo (p. ej. sin ítem configurado); 0, 403, 429 y 500+ los avisa el interceptor.
          if (err instanceof HttpErrorResponse && [400, 404, 422].includes(err.status)) {
            this.errorMessage.set(extractErrorMessage(err, 'No se pudo agregar el servicio.'));
          }
        },
      });
  }
}
