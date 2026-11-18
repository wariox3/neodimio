import { HttpErrorResponse } from '@angular/common/http';
import { Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { SelectModule } from 'primeng/select';
import { TextareaModule } from 'primeng/textarea';
import { extractErrorMessage, ToastService, trimFormValues } from '@semantica/core';
import {
  ErrorAlertComponent,
  LoadingSpinnerComponent,
  PageHeaderComponent,
} from '../../../../shared';
import { ROUTE_PATHS } from '../../../../core';
import { PQRS_MAX_LENGTH, PqrsTipo } from '../../models/pqrs.model';
import { PqrsService } from '../../services/pqrs.service';

/**
 * Registro de una PQRS (`cliente_crm_solicitud_nuevo` de terbio): tipo, descripción y los
 * datos de quien la registra. Al guardar vuelve al listado.
 */
@Component({
  selector: 'app-pqrs-nueva',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    ButtonModule,
    InputTextModule,
    MessageModule,
    SelectModule,
    TextareaModule,
    PageHeaderComponent,
    LoadingSpinnerComponent,
    ErrorAlertComponent,
  ],
  templateUrl: './pqrs-nueva.component.html',
  styleUrl: './pqrs-nueva.component.scss',
})
export class PqrsNuevaComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly pqrsService = inject(PqrsService);
  private readonly toastService = inject(ToastService);
  private readonly destroyRef = inject(DestroyRef);

  readonly listaRoute = ROUTE_PATHS.dashboard.crm.pqrs;
  readonly max = PQRS_MAX_LENGTH;

  readonly tipos = signal<PqrsTipo[]>([]);
  readonly cargandoTipos = signal(true);
  readonly errorTipos = signal<string | null>(null);
  readonly guardando = signal(false);
  readonly errorMessage = signal<string | null>(null);

  readonly form = this.fb.nonNullable.group({
    codigo_solicitud_tipo_fk: ['', Validators.required],
    descripcion: ['', [Validators.required, Validators.maxLength(PQRS_MAX_LENGTH.descripcion)]],
    nombre_contacto: ['', Validators.maxLength(PQRS_MAX_LENGTH.nombre_contacto)],
    numero_identificacion_contacto: [
      '',
      Validators.maxLength(PQRS_MAX_LENGTH.numero_identificacion_contacto),
    ],
    telefono_contacto: ['', Validators.maxLength(PQRS_MAX_LENGTH.telefono_contacto)],
    correo_contacto: [
      '',
      [Validators.email, Validators.maxLength(PQRS_MAX_LENGTH.correo_contacto)],
    ],
    cargo_contacto: ['', Validators.maxLength(PQRS_MAX_LENGTH.cargo_contacto)],
  });

  ngOnInit(): void {
    this.cargarTipos();
  }

  cargarTipos(): void {
    this.cargandoTipos.set(true);
    this.errorTipos.set(null);
    this.pqrsService
      .tipos()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (tipos) => {
          this.tipos.set(tipos);
          this.cargandoTipos.set(false);
        },
        error: (err) => {
          this.errorTipos.set(extractErrorMessage(err, 'No se pudieron cargar los tipos de PQRS.'));
          this.cargandoTipos.set(false);
        },
      });
  }

  /** Mensaje de error de un control, o `null` si es válido o no se ha tocado. */
  errorDe(nombre: keyof typeof this.form.controls): string | null {
    const control = this.form.controls[nombre];
    if (!control.touched || control.valid) return null;
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

    const valores = this.form.getRawValue();
    this.errorMessage.set(null);
    this.guardando.set(true);
    this.pqrsService
      .crear({
        codigo_solicitud_tipo_fk: valores.codigo_solicitud_tipo_fk,
        descripcion: valores.descripcion,
        // Los datos de contacto son opcionales: vacíos se envían como null.
        nombre_contacto: valores.nombre_contacto || null,
        numero_identificacion_contacto: valores.numero_identificacion_contacto || null,
        telefono_contacto: valores.telefono_contacto || null,
        correo_contacto: valores.correo_contacto || null,
        cargo_contacto: valores.cargo_contacto || null,
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (pqrs) => {
          this.toastService.success(
            'PQRS registrada',
            `Tu solicitud #${pqrs.codigo_solicitud_pk} quedó registrada.`,
          );
          this.router.navigateByUrl(this.listaRoute);
        },
        error: (err: unknown) => {
          this.guardando.set(false);
          // 0, 403 (sin cliente asignado), 429 y 500+ ya los avisa el interceptor.
          if (err instanceof HttpErrorResponse && [400, 404, 422].includes(err.status)) {
            this.errorMessage.set(extractErrorMessage(err, 'No se pudo registrar la PQRS.'));
          }
        },
      });
  }
}
