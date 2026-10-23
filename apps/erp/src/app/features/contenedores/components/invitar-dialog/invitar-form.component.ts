import { Component, DestroyRef, computed, inject, input, output, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Subject, catchError, of, switchMap, tap } from 'rxjs';
import {
  AutoCompleteCompleteEvent,
  AutoCompleteModule,
  AutoCompleteSelectEvent,
} from 'primeng/autocomplete';
import { ButtonModule } from 'primeng/button';
import { ToastService, extractErrorMessage } from '../../../../core';
import { Contenedor, UsuarioSeleccionar } from '../../models/contenedor.model';
import { InvitacionService } from '../../services/invitacion.service';
import { nombreCompleto, iniciales } from './miembro.utils';

/** Letras mínimas para lanzar la búsqueda de usuarios. */
const MIN_BUSQUEDA = 3;

/** Errores de validación del backend que se muestran con su mensaje. */
const ERRORES_VALIDACION = [400, 404, 422];

@Component({
  selector: 'app-invitar-form',
  standalone: true,
  imports: [FormsModule, AutoCompleteModule, ButtonModule],
  templateUrl: './invitar-form.component.html',
  styleUrl: './invitar-form.component.scss',
})
export class InvitarFormComponent {
  private readonly invitacionService = inject(InvitacionService);
  private readonly toastService = inject(ToastService);
  private readonly destroyRef = inject(DestroyRef);

  readonly contenedor = input.required<Contenedor>();
  readonly invited = output<void>();

  /**
   * Solo el propietario de la empresa puede invitar. Se toma de la membresía
   * del usuario (`control` en `/mas/user-tenant/lista`), no del rol global.
   */
  readonly esPropietario = computed(() => this.contenedor().control && this.contenedor().activo);

  readonly minBusqueda = MIN_BUSQUEDA;
  readonly valor = signal<UsuarioSeleccionar | string>('');
  readonly sugerencias = signal<UsuarioSeleccionar[]>([]);
  readonly enviando = signal(false);

  readonly usuarioSeleccionado = computed(() => {
    const v = this.valor();
    return typeof v === 'object' && v !== null ? v : null;
  });

  readonly nombreCompleto = nombreCompleto;
  readonly iniciales = iniciales;

  /** Términos tecleados; `switchMap` descarta la respuesta de un término anterior. */
  private readonly busqueda$ = new Subject<string>();

  constructor() {
    this.busqueda$
      .pipe(
        switchMap((termino) =>
          this.invitacionService
            .buscarUsuarios(termino)
            .pipe(catchError(() => of<UsuarioSeleccionar[]>([]))),
        ),
        tap((usuarios) => this.sugerencias.set(usuarios)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe();
  }

  buscar(event: AutoCompleteCompleteEvent): void {
    const query = event.query.trim();
    if (query.length < MIN_BUSQUEDA) {
      this.sugerencias.set([]);
      return;
    }
    this.busqueda$.next(query);
  }

  seleccionar(event: AutoCompleteSelectEvent): void {
    this.valor.set(event.value as UsuarioSeleccionar);
  }

  enviar(): void {
    const usuario = this.usuarioSeleccionado();
    if (!usuario || !this.esPropietario() || this.enviando()) return;

    this.enviando.set(true);
    this.invitacionService
      .invitar({ tenant_id: this.contenedor().tenant_id, usuario_invitado_id: usuario.id })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.enviando.set(false);
          this.toastService.success(
            'Invitación enviada',
            `${usuario.email} recibirá la invitación para unirse.`,
          );
          this.valor.set('');
          this.sugerencias.set([]);
          this.invited.emit();
        },
        error: (err: unknown) => {
          this.enviando.set(false);
          // 0, 403, 429 y 500+ ya los avisa el interceptor.
          if (err instanceof HttpErrorResponse && ERRORES_VALIDACION.includes(err.status)) {
            this.toastService.error(
              'No se pudo invitar',
              extractErrorMessage(err, 'Revisa los datos e intenta de nuevo.'),
            );
          }
        },
      });
  }
}
