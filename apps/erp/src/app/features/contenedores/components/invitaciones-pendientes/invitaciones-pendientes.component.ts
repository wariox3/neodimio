import { DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, DestroyRef, computed, inject, output, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ConfirmationService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastService, extractErrorMessage } from '../../../../core';
import { InvitacionRecibida } from '../../models/contenedor.model';
import { InvitacionService } from '../../services/invitacion.service';

/** Errores del backend que se muestran con su mensaje (ya respondida, no encontrada...). */
const ERRORES_VALIDACION = [400, 404, 422];

/**
 * Invitaciones pendientes del usuario, con las acciones aceptar y rechazar.
 * No se pinta nada mientras carga ni cuando no hay invitaciones.
 */
@Component({
  selector: 'app-invitaciones-pendientes',
  standalone: true,
  imports: [DatePipe, ButtonModule, ConfirmDialogModule],
  providers: [ConfirmationService],
  templateUrl: './invitaciones-pendientes.component.html',
  styleUrl: './invitaciones-pendientes.component.scss',
})
export class InvitacionesPendientesComponent {
  private readonly invitacionService = inject(InvitacionService);
  private readonly toastService = inject(ToastService);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly destroyRef = inject(DestroyRef);

  /** Se emite al aceptar una invitación, para recargar las empresas del usuario. */
  readonly aceptada = output<void>();

  readonly invitaciones = signal<InvitacionRecibida[]>([]);
  /** Invitación con una acción en curso; bloquea las demás acciones. */
  readonly procesandoId = signal<number | null>(null);
  readonly accionEnCurso = signal<'aceptar' | 'rechazar' | null>(null);

  readonly total = computed(() => this.invitaciones().length);

  constructor() {
    this.cargar();
  }

  empresa(invitacion: InvitacionRecibida): string {
    return invitacion.tenant_nombre?.trim() || `Empresa ${invitacion.tenant_id}`;
  }

  inicial(invitacion: InvitacionRecibida): string {
    return this.empresa(invitacion).charAt(0).toUpperCase();
  }

  invitadoPor(invitacion: InvitacionRecibida): string | null {
    return invitacion.usuario_nombre?.trim() || invitacion.usuario_email;
  }

  aceptar(invitacion: InvitacionRecibida): void {
    if (this.procesandoId() !== null) return;
    this.iniciar(invitacion, 'aceptar');
    this.invitacionService
      .aceptar(invitacion.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.terminar(invitacion);
          this.toastService.success(
            'Invitación aceptada',
            `Ya formas parte de ${this.empresa(invitacion)}.`,
          );
          this.aceptada.emit();
        },
        error: (err: unknown) => this.onError(err, 'No se pudo aceptar la invitación.'),
      });
  }

  confirmarRechazo(invitacion: InvitacionRecibida): void {
    if (this.procesandoId() !== null) return;
    this.confirmationService.confirm({
      header: 'Rechazar invitación',
      // Texto plano: el nombre de la empresa lo define otro usuario.
      message: `¿Rechazar la invitación a ${this.empresa(invitacion)}? Para unirte después necesitarás una nueva invitación.`,
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Rechazar',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-danger',
      rejectButtonStyleClass: 'p-button-text p-button-secondary',
      accept: () => this.rechazar(invitacion),
    });
  }

  private rechazar(invitacion: InvitacionRecibida): void {
    this.iniciar(invitacion, 'rechazar');
    this.invitacionService
      .rechazar(invitacion.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.terminar(invitacion);
          this.toastService.success(
            'Invitación rechazada',
            `Rechazaste la invitación a ${this.empresa(invitacion)}.`,
          );
        },
        error: (err: unknown) => this.onError(err, 'No se pudo rechazar la invitación.'),
      });
  }

  private cargar(): void {
    this.invitacionService
      .getPendientes()
      .pipe(takeUntilDestroyed(this.destroyRef))
      // Sin invitaciones o con error no se muestra el bloque; el interceptor
      // ya avisa los errores de conexión y del servidor.
      .subscribe({ next: (invitaciones) => this.invitaciones.set(invitaciones) });
  }

  private iniciar(invitacion: InvitacionRecibida, accion: 'aceptar' | 'rechazar'): void {
    this.procesandoId.set(invitacion.id);
    this.accionEnCurso.set(accion);
  }

  /** Quita la invitación respondida de la lista y libera las acciones. */
  private terminar(invitacion: InvitacionRecibida): void {
    this.invitaciones.update((lista) => lista.filter((i) => i.id !== invitacion.id));
    this.procesandoId.set(null);
    this.accionEnCurso.set(null);
  }

  private onError(err: unknown, fallback: string): void {
    this.procesandoId.set(null);
    this.accionEnCurso.set(null);
    // 0, 403, 429 y 500+ ya los avisa el interceptor.
    if (err instanceof HttpErrorResponse && ERRORES_VALIDACION.includes(err.status)) {
      this.toastService.error('Invitación', extractErrorMessage(err, fallback));
      // La invitación pudo cambiar de estado (ya respondida): se refresca la lista.
      this.cargar();
    }
  }
}
