import { HttpErrorResponse } from '@angular/common/http';
import { Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputNumberModule } from 'primeng/inputnumber';
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
import {
  COMENTARIOS_MAX_LENGTH,
  CotizacionTipo,
  ESTRATO_POR_DEFECTO,
  SECTORES,
  SectorCotizacion,
} from '../../models/cotizacion.model';
import { CotizacionService } from '../../services/cotizacion.service';

/**
 * Solicitud de una cotización nueva (`cliente_crm_contratacion_nuevo` de terbio). Se crea
 * sin servicios y se abre su detalle para agregarlos.
 */
@Component({
  selector: 'app-cotizacion-nueva',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    ButtonModule,
    InputNumberModule,
    MessageModule,
    SelectModule,
    TextareaModule,
    PageHeaderComponent,
    LoadingSpinnerComponent,
    ErrorAlertComponent,
  ],
  templateUrl: './cotizacion-nueva.component.html',
  styleUrl: './cotizacion-nueva.component.scss',
})
export class CotizacionNuevaComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly cotizacionService = inject(CotizacionService);
  private readonly toastService = inject(ToastService);
  private readonly destroyRef = inject(DestroyRef);

  readonly listaRoute = ROUTE_PATHS.dashboard.crm.cotizaciones;
  readonly sectores = SECTORES;
  readonly comentariosMax = COMENTARIOS_MAX_LENGTH;

  readonly tipos = signal<CotizacionTipo[]>([]);
  readonly cargandoTipos = signal(true);
  readonly errorTipos = signal<string | null>(null);
  readonly guardando = signal(false);
  readonly errorMessage = signal<string | null>(null);

  readonly form = this.fb.nonNullable.group({
    codigo_cotizacion_tipo_fk: ['', Validators.required],
    codigo_sector_fk: ['COM' as SectorCotizacion, Validators.required],
    estrato: [ESTRATO_POR_DEFECTO as number | null, [Validators.min(1), Validators.max(6)]],
    comentarios: ['', Validators.maxLength(COMENTARIOS_MAX_LENGTH)],
  });

  ngOnInit(): void {
    this.cargarTipos();
  }

  cargarTipos(): void {
    this.cargandoTipos.set(true);
    this.errorTipos.set(null);
    this.cotizacionService
      .tipos()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (tipos) => {
          this.tipos.set(tipos);
          // Como terbio, queda seleccionado el primero.
          if (tipos.length > 0 && !this.form.controls.codigo_cotizacion_tipo_fk.value) {
            this.form.controls.codigo_cotizacion_tipo_fk.setValue(
              tipos[0].codigo_cotizacion_tipo_pk,
            );
          }
          this.cargandoTipos.set(false);
        },
        error: (err) => {
          this.errorTipos.set(
            extractErrorMessage(err, 'No se pudieron cargar los tipos de cotización.'),
          );
          this.cargandoTipos.set(false);
        },
      });
  }

  /** Mensaje de error de un control, o `null` si es válido o no se ha tocado. */
  errorDe(nombre: keyof typeof this.form.controls): string | null {
    const control = this.form.controls[nombre];
    if (!control.touched || control.valid) return null;
    if (control.hasError('required')) return 'Este campo es obligatorio.';
    if (control.hasError('min') || control.hasError('max')) return 'El estrato va de 1 a 6.';
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

    const { codigo_cotizacion_tipo_fk, codigo_sector_fk, estrato, comentarios } =
      this.form.getRawValue();
    this.errorMessage.set(null);
    this.guardando.set(true);
    this.cotizacionService
      .crear({
        codigo_cotizacion_tipo_fk,
        codigo_sector_fk,
        estrato,
        comentarios: comentarios || null,
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (cotizacion) => {
          this.toastService.success(
            'Cotización creada',
            'Agrega los servicios que necesitas cotizar.',
          );
          this.router.navigateByUrl(
            ROUTE_PATHS.dashboard.crm.cotizacionDetalle(cotizacion.codigo_cotizacion_pk),
          );
        },
        error: (err: unknown) => {
          this.guardando.set(false);
          // 0, 403 (sin cliente asignado), 429 y 500+ ya los avisa el interceptor.
          if (err instanceof HttpErrorResponse && [400, 404, 422].includes(err.status)) {
            this.errorMessage.set(extractErrorMessage(err, 'No se pudo crear la cotización.'));
          }
        },
      });
  }
}
