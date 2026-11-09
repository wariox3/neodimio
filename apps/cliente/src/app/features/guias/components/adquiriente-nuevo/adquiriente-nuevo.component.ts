import { HttpErrorResponse } from '@angular/common/http';
import {
  Component,
  DestroyRef,
  effect,
  inject,
  model,
  output,
  signal,
  untracked,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { catchError, forkJoin, of } from 'rxjs';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { SelectModule } from 'primeng/select';
import { extractErrorMessage, ToastService, trimFormValues } from '@semantica/core';
import { TrimInputDirective } from '@semantica/ui';
import {
  CiudadGeneral,
  ConfiguracionGeneral,
  Identificacion,
} from '../../../catalogos/models/catalogo.model';
import { CatalogoService } from '../../../catalogos/services/catalogo.service';
import {
  ContextoAdquirienteNuevo,
  cuerpoAdquirienteNuevo,
  LONGITUD_NIT,
  validarNit,
} from '../../models/adquiriente.model';
import { Adquiriente } from '../../models/guia.model';

/**
 * Crea un adquiriente sin salir de la guía nueva: el formulario "Adquiriente nuevo" que
 * terbio mostraba debajo del buscador. Queda seleccionado al guardarlo.
 */
@Component({
  selector: 'app-adquiriente-nuevo',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    ButtonModule,
    DialogModule,
    InputTextModule,
    MessageModule,
    SelectModule,
    TrimInputDirective,
  ],
  templateUrl: './adquiriente-nuevo.component.html',
  styleUrl: './adquiriente-nuevo.component.scss',
})
export class AdquirienteNuevoComponent {
  private readonly fb = inject(FormBuilder);
  private readonly catalogoService = inject(CatalogoService);
  private readonly toastService = inject(ToastService);
  private readonly destroyRef = inject(DestroyRef);

  readonly visible = model(false);
  readonly creado = output<Adquiriente>();

  readonly longitudNit = LONGITUD_NIT;
  readonly identificaciones = signal<Identificacion[]>([]);
  readonly ciudades = signal<CiudadGeneral[]>([]);
  /** Asesor, condición y operación con que holmio creaba el tercero; `null` mientras carga. */
  private readonly contexto = signal<ContextoAdquirienteNuevo | null>(null);
  readonly guardando = signal(false);
  readonly errorMessage = signal<string | null>(null);

  readonly form = this.fb.nonNullable.group(
    {
      codigo_identificacion_fk: ['', Validators.required],
      numero_identificacion: ['', [Validators.required, Validators.maxLength(20)]],
      nombre_corto: ['', [Validators.required, Validators.maxLength(150)]],
      nombre1: ['', [Validators.required, Validators.maxLength(50)]],
      nombre2: ['', Validators.maxLength(50)],
      apellido1: ['', [Validators.required, Validators.maxLength(50)]],
      apellido2: ['', Validators.maxLength(50)],
      telefono: ['', [Validators.required, Validators.maxLength(30)]],
      celular: ['', [Validators.required, Validators.maxLength(30)]],
      direccion: ['', [Validators.required, Validators.maxLength(200)]],
      correo: ['', [Validators.required, Validators.email, Validators.maxLength(1000)]],
      codigo_ciudad_fk: [null as number | null, Validators.required],
    },
    { validators: validarNit },
  );

  constructor() {
    // Cada apertura empieza con el formulario limpio.
    effect(() => {
      if (this.visible()) {
        untracked(() => {
          this.form.reset();
          this.errorMessage.set(null);
          this.cargarDatos();
        });
      }
    });
  }

  /** Catálogos y valores generales; quedan en caché después de la primera apertura. */
  private cargarDatos(): void {
    forkJoin({
      identificaciones: this.catalogoService.identificaciones(),
      ciudades: this.catalogoService.ciudadesGenerales(),
      general: this.catalogoService.configuracionGeneral(),
      // Sin configuración del usuario el tercero se crea sin operación.
      usuario: this.catalogoService.configuracion().pipe(catchError(() => of(null))),
    })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: ({ identificaciones, ciudades, general, usuario }) => {
          this.identificaciones.set(identificaciones);
          this.ciudades.set(ciudades);
          this.contexto.set(contextoDe(general, usuario?.codigo_operacion_fk ?? null));
          if (!this.contexto()) {
            this.errorMessage.set(
              'La empresa no tiene configurados el asesor y la condición generales.',
            );
          }
        },
        // 0, 403, 429 y 500+ ya los avisa el interceptor.
        error: () => this.errorMessage.set('No se pudieron cargar los datos del formulario.'),
      });
  }

  /** Mensaje de error de un control, o `null` si es válido o no se ha tocado. */
  errorDe(nombre: keyof typeof this.form.controls): string | null {
    const control = this.form.controls[nombre];
    if (!control.touched) return null;
    if (nombre === 'numero_identificacion' && control.valid && this.form.hasError('nit')) {
      return `El NIT debe tener ${LONGITUD_NIT} dígitos, sin el dígito de verificación.`;
    }
    if (control.valid) return null;
    if (control.hasError('required')) return 'Este campo es obligatorio.';
    if (control.hasError('email')) return 'Ingresa un correo válido.';
    if (control.hasError('maxlength')) {
      return `Máximo ${control.errors?.['maxlength'].requiredLength} caracteres.`;
    }
    return 'Valor inválido.';
  }

  guardar(): void {
    trimFormValues(this.form);

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.errorMessage.set('Revisa los campos marcados antes de guardar.');
      return;
    }
    const contexto = this.contexto();
    if (!contexto) {
      this.errorMessage.set('La empresa no tiene configurados el asesor y la condición generales.');
      return;
    }

    this.errorMessage.set(null);
    this.guardando.set(true);
    this.catalogoService
      .crearTercero(cuerpoAdquirienteNuevo(this.form.getRawValue(), contexto))
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (tercero) => {
          this.guardando.set(false);
          this.toastService.success('Adquiriente creado', 'Quedó seleccionado en la guía.');
          this.creado.emit({
            codigo_tercero_pk: tercero.codigo_tercero_pk,
            codigo_identificacion_fk: tercero.codigo_identificacion_fk ?? '',
            numero_identificacion: tercero.numero_identificacion ?? '',
            nombre_corto: tercero.nombre_corto ?? '',
          });
          this.visible.set(false);
        },
        error: (err: unknown) => {
          this.guardando.set(false);
          // 409 es una identificación repetida; 0, 403, 429 y 500+ ya los avisa el interceptor.
          if (err instanceof HttpErrorResponse && [400, 404, 409, 422].includes(err.status)) {
            this.errorMessage.set(extractErrorMessage(err, 'No se pudo crear el adquiriente.'));
          }
        },
      });
  }
}

/** Como holmio, sin asesor o condición generales no se puede crear el tercero. */
function contextoDe(
  general: ConfiguracionGeneral,
  operacion: string | null,
): ContextoAdquirienteNuevo | null {
  const { codigo_asesor_general_fk: asesor, codigo_condicion_general_fk: condicion } = general;
  if (asesor === null || condicion === null) return null;
  return { asesor, condicion, operacion };
}
