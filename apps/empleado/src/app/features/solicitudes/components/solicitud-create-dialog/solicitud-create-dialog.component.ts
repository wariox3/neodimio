import { Component, DestroyRef, inject, model, OnInit, output, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { debounceTime, distinctUntilChanged, Subject, switchMap } from 'rxjs';
import { DialogModule } from 'primeng/dialog';
import { SelectModule, SelectFilterEvent } from 'primeng/select';
import { TextareaModule } from 'primeng/textarea';
import { DatePickerModule } from 'primeng/datepicker';
import { ButtonModule } from 'primeng/button';
import { SolicitudesService } from '../../services/solicitudes.service';
import { SolicitudEmpleadoTipo } from '../../models/solicitud.model';
import { AuthService } from '../../../auth/services/auth.service';
import { ToastService } from '../../../../core';
import { dateRangeValidator } from '@semantica/core';

@Component({
  selector: 'app-solicitud-create-dialog',
  standalone: true,
  imports: [ReactiveFormsModule, DialogModule, SelectModule, TextareaModule, DatePickerModule, ButtonModule],
  templateUrl: './solicitud-create-dialog.component.html',
  styleUrl: './solicitud-create-dialog.component.scss',
})
export class SolicitudCreateDialogComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly solicitudesService = inject(SolicitudesService);
  private readonly authService = inject(AuthService);
  private readonly toastService = inject(ToastService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly filterSubject = new Subject<string>();

  readonly visible = model(false);
  readonly created = output<void>();

  readonly tipos = signal<SolicitudEmpleadoTipo[]>([]);
  readonly loadingTipos = signal(false);
  readonly submitting = signal(false);

  readonly form = this.fb.nonNullable.group(
    {
      codigo_solicitud_empleado_tipo_fk: ['', Validators.required],
      fecha_desde: [new Date() as Date | null, Validators.required],
      fecha_hasta: [new Date() as Date | null, Validators.required],
      comentario: ['', Validators.maxLength(2000)],
    },
    { validators: dateRangeValidator('fecha_desde', 'fecha_hasta') },
  );

  ngOnInit(): void {
    this.filterSubject
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        switchMap((nombre) => {
          this.loadingTipos.set(true);
          return this.solicitudesService.getTipos(nombre || undefined);
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (res) => {
          this.tipos.set(res.items);
          this.loadingTipos.set(false);
        },
        error: () => {
          this.tipos.set([]);
          this.loadingTipos.set(false);
        },
      });
  }

  onShow(): void {
    this.form.reset();
    this.loadTipos();
  }

  onHide(): void {
    this.form.reset();
    this.tipos.set([]);
  }

  onFilterTipos(event: SelectFilterEvent): void {
    this.filterSubject.next(event.filter?.trim() || '');
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const user = this.authService.currentUser();
    if (!user?.empleado_id) return;

    this.submitting.set(true);
    const { codigo_solicitud_empleado_tipo_fk, fecha_desde, fecha_hasta, comentario } =
      this.form.getRawValue();

    this.solicitudesService
      .crearSolicitud({
        codigo_empleado_fk: user.empleado_id,
        codigo_solicitud_empleado_tipo_fk,
        fecha_desde: fecha_desde!.toISOString(),
        fecha_hasta: fecha_hasta!.toISOString(),
        comentario: comentario || null,
      })
      .subscribe({
        next: () => {
          this.toastService.success(
            'Solicitud creada',
            'La solicitud se registró correctamente.',
          );
          this.submitting.set(false);
          this.created.emit();
          this.visible.set(false);
        },
        error: () => {
          this.submitting.set(false);
        },
      });
  }

  private loadTipos(nombre?: string): void {
    this.loadingTipos.set(true);
    this.solicitudesService.getTipos(nombre).subscribe({
      next: (res) => {
        this.tipos.set(res.items);
        this.loadingTipos.set(false);
      },
      error: () => {
        this.tipos.set([]);
        this.loadingTipos.set(false);
      },
    });
  }
}
