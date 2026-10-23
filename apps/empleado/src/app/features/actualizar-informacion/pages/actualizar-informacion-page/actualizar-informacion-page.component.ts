import { Component, computed, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { debounceTime, distinctUntilChanged, Subject, switchMap } from 'rxjs';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { MessageModule } from 'primeng/message';
import { SelectFilterEvent, SelectModule } from 'primeng/select';
import { PageHeaderComponent, TrimInputDirective } from '@semantica/ui';
import { ToastService, extractErrorMessage, trimFormValues } from '@semantica/core';
import { ActualizarInformacionService } from '../../services/actualizar-informacion.service';
import { AuthService } from '../../../auth/services/auth.service';
import {
  ActualizarInformacionRequest,
  Ciudad,
  EmpleadoDetalle,
} from '../../models/empleado-detalle.model';

@Component({
  selector: 'app-actualizar-informacion-page',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    InputTextModule,
    ButtonModule,
    MessageModule,
    SelectModule,
    PageHeaderComponent,
    TrimInputDirective,
  ],
  templateUrl: './actualizar-informacion-page.component.html',
  styleUrl: './actualizar-informacion-page.component.scss',
})
export class ActualizarInformacionPageComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly actualizarInfoService = inject(ActualizarInformacionService);
  private readonly authService = inject(AuthService);
  private readonly toastService = inject(ToastService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly filterCiudadesSubject = new Subject<string>();

  readonly isLoading = signal(true);
  readonly isSaving = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly ciudades = signal<Ciudad[]>([]);
  readonly loadingCiudades = signal(false);

  private readonly detalle = signal<EmpleadoDetalle | null>(null);

  readonly nombreCompleto = computed(() => {
    const d = this.detalle();
    if (!d) return '';
    return d.nombre_corto;
  });

  readonly identificacion = computed(() => {
    const d = this.detalle();
    if (!d) return '';
    return `${d.codigo_identificacion_fk} ${d.numero_identificacion}`;
  });

  readonly correo = computed(() => this.detalle()?.correo ?? '—');

  readonly form = this.fb.group({
    telefono: ['', [Validators.required]],
    celular: ['', [Validators.required]],
    direccion: ['', [Validators.required]],
    barrio: ['', [Validators.required]],
    codigo_ciudad_fk: [null as number | null, [Validators.required]],
  });

  get telefonoControl() {
    return this.form.controls.telefono;
  }

  get celularControl() {
    return this.form.controls.celular;
  }

  get direccionControl() {
    return this.form.controls.direccion;
  }

  get barrioControl() {
    return this.form.controls.barrio;
  }

  get ciudadControl() {
    return this.form.controls.codigo_ciudad_fk;
  }

  ngOnInit(): void {
    this.filterCiudadesSubject
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        switchMap((nombre) => {
          this.loadingCiudades.set(true);
          return this.actualizarInfoService.getCiudades({ nombre: nombre || undefined });
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (res) => {
          let items = res.items;
          const selectedCityId = this.form.value.codigo_ciudad_fk;
          if (selectedCityId != null && !items.some((c) => c.codigo_ciudad_pk === selectedCityId)) {
            const selectedCity = this.ciudades().find((c) => c.codigo_ciudad_pk === selectedCityId);
            if (selectedCity) {
              items = [selectedCity, ...items];
            }
          }
          this.ciudades.set(items);
          this.loadingCiudades.set(false);
        },
        error: () => {
          this.ciudades.set([]);
          this.loadingCiudades.set(false);
        },
      });

    this.loadEmpleadoDetalle();
  }

  onFilterCiudades(event: SelectFilterEvent): void {
    this.filterCiudadesSubject.next(event.filter?.trim() || '');
  }

  private loadEmpleadoDetalle(): void {
    const user = this.authService.currentUser();

    if (!user?.empleado_id) {
      this.isLoading.set(false);
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.actualizarInfoService.getEmpleadoDetalle(user.empleado_id).subscribe({
      next: (detalle) => {
        this.detalle.set(detalle);
        this.form.patchValue({
          telefono: detalle.telefono ?? '',
          celular: detalle.celular ?? '',
          direccion: detalle.direccion ?? '',
          barrio: detalle.barrio ?? '',
          codigo_ciudad_fk: detalle.codigo_ciudad_fk,
        });
        this.form.markAsPristine();
        this.isLoading.set(false);
        this.loadCiudades();
      },
      error: (err) => {
        this.errorMessage.set(
          extractErrorMessage(err, 'No se pudo cargar la información del empleado.'),
        );
        this.isLoading.set(false);
      },
    });
  }

  onSubmit(): void {
    trimFormValues(this.form);

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const detalle = this.detalle();
    if (!detalle) return;

    this.isSaving.set(true);
    this.errorMessage.set(null);

    const body: ActualizarInformacionRequest = {
      codigo_empleado_fk: detalle.codigo_empleado_pk,
      codigo_ciudad_fk: this.form.value.codigo_ciudad_fk ?? null,
      celular: this.form.value.celular!,
      telefono: this.form.value.telefono!,
      direccion: this.form.value.direccion!,
      barrio: this.form.value.barrio!,
    };

    this.actualizarInfoService.solicitarActualizacion(body).subscribe({
      next: () => {
        this.isSaving.set(false);
        this.toastService.success('Solicitud enviada correctamente');
        this.form.markAsPristine();
      },
      error: (err) => {
        this.isSaving.set(false);
        this.errorMessage.set(
          extractErrorMessage(err, 'No se pudo enviar la solicitud de actualización.'),
        );
      },
    });
  }

  retry(): void {
    this.loadEmpleadoDetalle();
  }

  private loadCiudades(): void {
    this.loadingCiudades.set(true);
    const selectedCityId = this.form.value.codigo_ciudad_fk;

    this.actualizarInfoService.getCiudades().subscribe({
      next: (res) => {
        let items = res.items;
        const needsFetch =
          selectedCityId != null && !items.some((c) => c.codigo_ciudad_pk === selectedCityId);

        if (needsFetch) {
          this.actualizarInfoService.getCiudades({ ciudad_id: selectedCityId }).subscribe({
            next: (selectedRes) => {
              if (selectedRes.items.length > 0) {
                items = [selectedRes.items[0], ...items];
              }
              this.ciudades.set(items);
              this.loadingCiudades.set(false);
            },
            error: () => {
              this.ciudades.set(items);
              this.loadingCiudades.set(false);
            },
          });
        } else {
          this.ciudades.set(items);
          this.loadingCiudades.set(false);
        }
      },
      error: () => {
        this.ciudades.set([]);
        this.loadingCiudades.set(false);
      },
    });
  }
}
