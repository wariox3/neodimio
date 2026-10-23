import {
  Component,
  DestroyRef,
  computed,
  effect,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { SkeletonModule } from 'primeng/skeleton';
import { extractErrorMessage } from '../../../../core';
import { ErrorAlertComponent } from '../../../../shared';
import { AuthService } from '../../../auth/services/auth.service';
import { Contenedor, ContenedorMiembro } from '../../models/contenedor.model';
import { InvitacionService } from '../../services/invitacion.service';
import { iniciales, nombreCompleto } from './miembro.utils';

@Component({
  selector: 'app-miembros-list',
  standalone: true,
  imports: [SkeletonModule, ErrorAlertComponent],
  templateUrl: './miembros-list.component.html',
  styleUrl: './miembros-list.component.scss',
})
export class MiembrosListComponent {
  private readonly invitacionService = inject(InvitacionService);
  private readonly authService = inject(AuthService);
  private readonly destroyRef = inject(DestroyRef);

  readonly contenedor = input.required<Contenedor>();
  readonly countChange = output<number>();

  readonly miembros = signal<ContenedorMiembro[]>([]);
  readonly loading = signal(false);
  readonly errorMessage = signal<string | null>(null);

  readonly skeletonItems = Array.from({ length: 3 });
  readonly nombreCompleto = nombreCompleto;
  readonly iniciales = iniciales;

  private readonly currentUserId = computed(() => this.authService.currentUser()?.id ?? null);

  /** Propietarios primero; después el resto por nombre o correo. */
  readonly miembrosOrdenados = computed(() =>
    [...this.miembros()].sort((a, b) => {
      const porRol = Number(b.control) - Number(a.control);
      if (porRol !== 0) return porRol;
      return (nombreCompleto(a) || a.email).localeCompare(nombreCompleto(b) || b.email);
    }),
  );

  constructor() {
    effect(() => this.cargar(this.contenedor().tenant_id));
  }

  esTu(miembro: ContenedorMiembro): boolean {
    return miembro.usuario_id === this.currentUserId();
  }

  recargar(): void {
    this.cargar(this.contenedor().tenant_id);
  }

  private cargar(tenantId: number): void {
    this.loading.set(true);
    this.errorMessage.set(null);
    this.invitacionService
      .getMiembros(tenantId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (miembros) => {
          this.miembros.set(miembros);
          this.countChange.emit(miembros.length);
          this.loading.set(false);
        },
        error: (err: unknown) => {
          this.errorMessage.set(extractErrorMessage(err, 'No se pudieron cargar los miembros.'));
          this.loading.set(false);
        },
      });
  }
}
