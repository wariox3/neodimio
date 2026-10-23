import { Component, computed, DestroyRef, effect, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { forkJoin, switchMap } from 'rxjs';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { MessageModule } from 'primeng/message';
import { AvatarModule } from 'primeng/avatar';
import { DividerModule } from 'primeng/divider';
import { PageHeaderComponent, TrimInputDirective } from '@semantica/ui';
import {
  ActiveTenantService,
  ToastService,
  extractErrorMessage,
  trimFormValues,
} from '@semantica/core';
import { PerfilService } from '../../services/perfil.service';
import { PerfilDetalle, UpdatePerfilRequest } from '../../models/perfil.model';
import { AuthService } from '../../../auth/services/auth.service';
import { CambiarEmpresaDialogComponent } from '../../components/cambiar-empresa-dialog/cambiar-empresa-dialog.component';
import { MembresiaService } from '../../../dashboard/services/membresia.service';

@Component({
  selector: 'app-perfil-page',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    InputTextModule,
    ButtonModule,
    MessageModule,
    AvatarModule,
    DividerModule,
    PageHeaderComponent,
    CambiarEmpresaDialogComponent,
    TrimInputDirective,
  ],
  templateUrl: './perfil-page.component.html',
  styleUrl: './perfil-page.component.scss',
})
export class PerfilPageComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly perfilService = inject(PerfilService);
  private readonly toastService = inject(ToastService);
  private readonly authService = inject(AuthService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly activeTenant = inject(ActiveTenantService).tenant;
  private readonly membresiaService = inject(MembresiaService);

  readonly isLoading = signal(true);
  readonly isSaving = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly cambiarEmpresaVisible = signal(false);

  private readonly detalle = signal<PerfilDetalle | null>(null);

  readonly hasTenant = this.authService.hasTenant;

  /** Empresa elegida actualmente. */
  readonly empresaActual = computed(() => this.activeTenant()?.nombre ?? null);

  readonly userInitials = computed(() => {
    const d = this.detalle();
    if (!d) return '?';
    const first = d.nombres?.trim().charAt(0).toUpperCase() ?? '';
    const last = d.apellidos?.trim().charAt(0).toUpperCase() ?? '';
    return `${first}${last}` || '?';
  });

  readonly userFullName = computed(() => {
    const d = this.detalle();
    if (!d) return '';
    return `${d.nombres ?? ''} ${d.apellidos ?? ''}`.trim() || 'Sin nombre';
  });

  readonly userEmail = computed(() => this.detalle()?.email ?? '');

  /**
   * El documento identifica al usuario como empleado (así lo asocia el backend):
   * si ya está vinculado como empleado en alguna empresa, no se puede cambiar.
   */
  readonly isIdentificacionLocked = computed(() =>
    (this.membresiaService.membresias() ?? []).some((m) => m.empleado_id !== null),
  );

  readonly form = this.fb.group({
    nombres: this.fb.nonNullable.control('', [Validators.required, Validators.minLength(2)]),
    apellidos: this.fb.nonNullable.control('', [Validators.required, Validators.minLength(2)]),
    numero_identificacion: this.fb.nonNullable.control('', [Validators.required]),
    email: [{ value: '', disabled: true }],
  });

  get nombresControl() {
    return this.form.controls.nombres;
  }

  get apellidosControl() {
    return this.form.controls.apellidos;
  }

  get identificacionControl() {
    return this.form.controls.numero_identificacion;
  }

  constructor() {
    // El bloqueo depende de las membresías, que pueden llegar después del
    // detalle (entrada directa al perfil): el campo sigue al estado actual.
    effect(() => {
      const control = this.form.controls.numero_identificacion;
      if (this.isIdentificacionLocked()) control.disable();
      else control.enable();
    });
  }

  ngOnInit(): void {
    this.loadDetalle();
  }

  private loadDetalle(): void {
    this.isLoading.set(true);
    this.perfilService
      .getDetalle()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (detalle) => {
          this.patchDetalle(detalle);
          this.isLoading.set(false);
        },
        error: () => {
          this.isLoading.set(false);
        },
      });
  }

  /**
   * Tras cambiar de empresa, el `empleado_id` y el bloqueo de identificación
   * cambian, por lo que se recarga el detalle del perfil.
   */
  onEmpresaCambiada(): void {
    this.cambiarEmpresaVisible.set(false);
    this.loadDetalle();
  }

  private patchDetalle(detalle: PerfilDetalle): void {
    this.detalle.set(detalle);
    this.form.patchValue({
      nombres: detalle.nombres ?? '',
      apellidos: detalle.apellidos ?? '',
      numero_identificacion: detalle.numero_identificacion ?? '',
      email: detalle.email,
    });
    this.form.markAsPristine();
  }

  onSubmit(): void {
    trimFormValues(this.form);

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSaving.set(true);
    this.errorMessage.set(null);

    const data: UpdatePerfilRequest = {
      nombres: this.form.getRawValue().nombres,
      apellidos: this.form.getRawValue().apellidos,
      numero_identificacion: this.form.getRawValue().numero_identificacion,
    };

    this.perfilService
      .updatePerfil(data)
      .pipe(
        // Refresca el detalle local y el estado global de auth (`currentUser`),
        // que tambien lee el dialogo de asociar empresa para mostrar la identidad.
        switchMap(() =>
          forkJoin({
            detalle: this.perfilService.getDetalle(),
            user: this.authService.me(),
          }),
        ),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: ({ detalle }) => {
          this.patchDetalle(detalle);
          this.isSaving.set(false);
          this.toastService.success('Perfil actualizado correctamente');
        },
        error: (err) => {
          this.isSaving.set(false);
          this.errorMessage.set(extractErrorMessage(err, 'Error al actualizar el perfil'));
        },
      });
  }
}
