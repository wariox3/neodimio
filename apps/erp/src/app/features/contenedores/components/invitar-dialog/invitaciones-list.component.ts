import { DatePipe } from '@angular/common';
import { Component, DestroyRef, effect, inject, input, output, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { SkeletonModule } from 'primeng/skeleton';
import { extractErrorMessage } from '../../../../core';
import { ErrorAlertComponent } from '../../../../shared';
import { Contenedor, InvitacionEmpresa, InvitacionEstado } from '../../models/contenedor.model';
import { InvitacionService } from '../../services/invitacion.service';
import { inicialesDe } from './miembro.utils';

/** Etiqueta y variante de color de cada estado de invitación. */
const ESTADOS: Record<InvitacionEstado, { label: string; tag: string }> = {
  pendiente: { label: 'Pendiente', tag: 'tag--aviso' },
  aceptada: { label: 'Aceptada', tag: 'tag--exito' },
  rechazada: { label: 'Rechazada', tag: 'tag--peligro' },
  cancelada: { label: 'Cancelada', tag: '' },
};

@Component({
  selector: 'app-invitaciones-list',
  standalone: true,
  imports: [DatePipe, SkeletonModule, ErrorAlertComponent],
  templateUrl: './invitaciones-list.component.html',
  styleUrl: './invitaciones-list.component.scss',
})
export class InvitacionesListComponent {
  private readonly invitacionService = inject(InvitacionService);
  private readonly destroyRef = inject(DestroyRef);

  readonly contenedor = input.required<Contenedor>();
  /** Cambia cada vez que se envía una invitación, para recargar la lista. */
  readonly refreshToken = input(0);
  readonly countChange = output<number>();

  readonly invitaciones = signal<InvitacionEmpresa[]>([]);
  readonly loading = signal(false);
  readonly errorMessage = signal<string | null>(null);

  readonly skeletonItems = Array.from({ length: 3 });

  constructor() {
    effect(() => {
      this.refreshToken();
      this.cargar(this.contenedor().tenant_id);
    });
  }

  iniciales(invitacion: InvitacionEmpresa): string {
    return inicialesDe(invitacion.usuario_invitado_nombre, invitacion.usuario_invitado_email);
  }

  estadoLabel(estado: InvitacionEstado): string {
    return ESTADOS[estado]?.label ?? estado;
  }

  estadoTag(estado: InvitacionEstado): string {
    return ESTADOS[estado]?.tag ?? '';
  }

  recargar(): void {
    this.cargar(this.contenedor().tenant_id);
  }

  private cargar(tenantId: number): void {
    this.loading.set(true);
    this.errorMessage.set(null);
    this.invitacionService
      .getInvitaciones(tenantId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (invitaciones) => {
          this.invitaciones.set(invitaciones);
          this.countChange.emit(invitaciones.length);
          this.loading.set(false);
        },
        error: (err: unknown) => {
          this.errorMessage.set(
            extractErrorMessage(err, 'No se pudieron cargar las invitaciones.'),
          );
          this.loading.set(false);
        },
      });
  }
}
