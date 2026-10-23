import { Component, inject, model, output, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { SelectModule } from 'primeng/select';
import { TextareaModule } from 'primeng/textarea';
import { ButtonModule } from 'primeng/button';
import { ReclamosService } from '../../services/reclamos.service';
import { ReclamoConcepto } from '../../models/reclamo.model';
import { AuthService } from '../../../auth/services/auth.service';
import { ToastService } from '../../../../core';

@Component({
  selector: 'app-reclamo-create-dialog',
  standalone: true,
  imports: [ReactiveFormsModule, DialogModule, SelectModule, TextareaModule, ButtonModule],
  templateUrl: './reclamo-create-dialog.component.html',
  styleUrl: './reclamo-create-dialog.component.scss',
})
export class ReclamoCreateDialogComponent {
  private readonly fb = inject(FormBuilder);
  private readonly reclamosService = inject(ReclamosService);
  private readonly authService = inject(AuthService);
  private readonly toastService = inject(ToastService);

  readonly visible = model(false);
  readonly created = output<void>();

  readonly conceptos = signal<ReclamoConcepto[]>([]);
  readonly loadingConceptos = signal(false);
  readonly submitting = signal(false);

  readonly form = this.fb.nonNullable.group({
    codigo_reclamo_concepto_fk: ['', Validators.required],
    descripcion: ['', [Validators.required, Validators.maxLength(2000)]],
  });

  onShow(): void {
    if (this.conceptos().length === 0) {
      this.loadingConceptos.set(true);
      this.reclamosService.getConceptos().subscribe({
        next: (res) => {
          this.conceptos.set(res.items);
          this.loadingConceptos.set(false);
        },
        error: () => {
          this.loadingConceptos.set(false);
        },
      });
    }
  }

  onHide(): void {
    this.form.reset();
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const user = this.authService.currentUser();
    if (!user?.empleado_id) return;

    this.submitting.set(true);
    const { codigo_reclamo_concepto_fk, descripcion } = this.form.getRawValue();

    this.reclamosService
      .createReclamo({
        codigo_empleado_fk: user.empleado_id,
        codigo_reclamo_concepto_fk,
        descripcion,
      })
      .subscribe({
        next: () => {
          this.toastService.success('Reclamo creado', 'El reclamo se registró correctamente.');
          this.submitting.set(false);
          this.created.emit();
          this.visible.set(false);
        },
        error: () => {
          this.submitting.set(false);
        },
      });
  }
}
