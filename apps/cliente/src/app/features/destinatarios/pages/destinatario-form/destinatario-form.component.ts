import { Component, DestroyRef, OnInit, computed, inject, input, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { MessageModule } from 'primeng/message';
import { ToastService, extractErrorMessage, trimFormValues } from '@semantica/core';
import { PageHeaderComponent } from '@semantica/ui';
import { ErrorAlertComponent, LoadingSpinnerComponent } from '../../../../shared';
import { ROUTE_PATHS } from '../../../../core';
import { OpcionCatalogo } from '../../../catalogos/models/catalogo.model';
import { CatalogoService } from '../../../catalogos/services/catalogo.service';
import { DestinatarioCamposComponent } from '../../components/destinatario-campos/destinatario-campos.component';
import {
  crearFormularioDestinatario,
  mensajeDeRechazo,
} from '../../components/destinatario-campos/destinatario.form';
import { DestinatarioService } from '../../services/destinatario.service';

/**
 * Crear y editar destinatarios (`cliente_transporte_destinatario_nuevo` de terbio).
 *
 * Crear queda asociado al cliente del usuario. Editar solo muestra los datos: fluor
 * no expone cómo actualizar un destinatario (solo `POST /nuevo`).
 */
@Component({
  selector: 'app-destinatario-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    ButtonModule,
    MessageModule,
    PageHeaderComponent,
    LoadingSpinnerComponent,
    ErrorAlertComponent,
    DestinatarioCamposComponent,
  ],
  templateUrl: './destinatario-form.component.html',
  styleUrl: './destinatario-form.component.scss',
})
export class DestinatarioFormComponent implements OnInit {
  private readonly destinatarioService = inject(DestinatarioService);
  private readonly catalogoService = inject(CatalogoService);
  private readonly toastService = inject(ToastService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly router = inject(Router);

  /** Id del destinatario a editar, desde `:id`; vacío al crear. */
  readonly id = input<string>();
  readonly esEdicion = computed(() => !!this.id());

  readonly listaRoute = ROUTE_PATHS.dashboard.transporte.destinatarios;

  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly errorMessage = signal<string | null>(null);
  readonly guardando = signal(false);
  readonly identificaciones = signal<OpcionCatalogo[]>([]);

  readonly form = crearFormularioDestinatario(inject(FormBuilder));

  ngOnInit(): void {
    this.catalogoService
      .identificaciones()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((v) =>
        this.identificaciones.set(
          v.map((i) => ({
            value: i.codigo_identificacion_pk,
            label: i.nombre ?? i.codigo_identificacion_pk,
          })),
        ),
      );
    this.cargar();
  }

  cargar(): void {
    const id = this.id();
    if (!id) return;

    this.loading.set(true);
    this.error.set(null);
    this.destinatarioService
      .obtener(Number(id))
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (d) => {
          this.form.patchValue({
            codigo_identificacion_fk: d.codigo_identificacion_fk ?? '',
            numero_identificacion: d.numero_identificacion ?? '',
            nombre_corto: d.nombre_corto ?? '',
            direccion: d.direccion ?? '',
            telefono: d.telefono ?? '',
            codigo_ciudad_fk: d.codigo_ciudad_fk ?? '',
          });
          this.loading.set(false);
        },
        error: (err) => {
          this.error.set(extractErrorMessage(err, 'No se pudo cargar el destinatario.'));
          this.loading.set(false);
        },
      });
  }

  onSubmit(): void {
    trimFormValues(this.form);

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.errorMessage.set('Revisa los campos marcados antes de guardar.');
      return;
    }

    this.errorMessage.set(null);

    if (this.esEdicion()) {
      this.toastService.info(
        'Edición pendiente',
        'Los cambios se podrán guardar cuando se conecte el servicio.',
      );
      return;
    }

    this.guardando.set(true);
    this.destinatarioService
      .crear(this.form.getRawValue())
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.guardando.set(false);
          this.toastService.success('Destinatario creado', 'Ya puedes usarlo en tus guías.');
          this.router.navigateByUrl(this.listaRoute);
        },
        error: (err: unknown) => {
          this.guardando.set(false);
          this.errorMessage.set(mensajeDeRechazo(err));
        },
      });
  }
}
