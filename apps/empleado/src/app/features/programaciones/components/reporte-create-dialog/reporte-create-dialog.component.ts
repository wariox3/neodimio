import { Component, inject, input, model, output, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { SelectModule } from 'primeng/select';
import { TextareaModule } from 'primeng/textarea';
import { ButtonModule } from 'primeng/button';
import { InputNumberModule } from 'primeng/inputnumber';
import { ProgramacionesService } from '../../services/programaciones.service';
import { ProgramacionReporteTipo } from '../../models/programacion.model';
import { ToastService } from '../../../../core';
import { AuthService } from '../../../auth/services/auth.service';

@Component({
  selector: 'app-reporte-create-dialog',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    DialogModule,
    SelectModule,
    TextareaModule,
    ButtonModule,
    InputNumberModule,
  ],
  templateUrl: './reporte-create-dialog.component.html',
  styleUrl: './reporte-create-dialog.component.scss',
})
export class ReporteCreateDialogComponent {
  private readonly fb = inject(FormBuilder);
  private readonly programacionesService = inject(ProgramacionesService);
  private readonly toastService = inject(ToastService);
  private readonly authService = inject(AuthService);

  readonly codigoProgramacion = input.required<number>();
  readonly visible = model(false);
  readonly created = output<void>();

  readonly tipos = signal<ProgramacionReporteTipo[]>([]);
  readonly loadingTipos = signal(false);
  readonly submitting = signal(false);

  readonly form = this.fb.nonNullable.group({
    codigo_programacion_reporte_tipo_fk: ['', Validators.required],
    comentario: ['', [Validators.required, Validators.maxLength(500)]],
    dia_desde: [1, [Validators.required, Validators.min(1)]],
    dia_hasta: [1, [Validators.required, Validators.min(1)]],
  });

  onShow(): void {
    if (this.tipos().length === 0) {
      this.loadingTipos.set(true);
      this.programacionesService.getReporteTipos().subscribe({
        next: (res) => {
          this.tipos.set(res.items);
          this.loadingTipos.set(false);
        },
        error: () => {
          this.loadingTipos.set(false);
        },
      });
    }
  }

  onHide(): void {
    this.form.reset({ dia_desde: 1, dia_hasta: 1 });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting.set(true);
    const { codigo_programacion_reporte_tipo_fk, comentario, dia_desde, dia_hasta } =
      this.form.getRawValue();

    this.programacionesService
      .createReporte({
        codigo_programacion_fk: this.codigoProgramacion(),
        codigo_programacion_reporte_tipo_fk,
        comentario,
        dia_desde,
        dia_hasta,
        reporta: this.authService.currentUser()!.email,
      })
      .subscribe({
        next: () => {
          this.toastService.success('Reporte creado', 'El reporte se registró correctamente.');
          this.submitting.set(false);
          this.created.emit();
          this.visible.set(false);
        },
        error: (err) => {
          this.submitting.set(false);
          if (err.status === 422 || err.status === 400) {
            this.toastService.error(
              'Error de validación',
              'Los datos enviados no son válidos. Revisa el formulario.',
            );
          }
        },
      });
  }
}
