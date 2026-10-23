import { Component, computed, inject, signal, viewChild } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { ConfirmationService, MenuItem } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { Menu, MenuModule } from 'primeng/menu';
import { SkeletonModule } from 'primeng/skeleton';
import {
  ActiveTenantService,
  ROUTE_PATHS,
  ToastService,
  extractErrorMessage,
} from '../../../../core';
import { EmptyStateComponent, ErrorAlertComponent } from '../../../../shared';
import { AuthService } from '../../../auth/services/auth.service';
import { ApiKeyService } from '../../../seguridad/services/api-key.service';
import { InvitacionesPendientesComponent } from '../../components/invitaciones-pendientes/invitaciones-pendientes.component';
import { InvitarDialogComponent } from '../../components/invitar-dialog/invitar-dialog.component';
import { Contenedor } from '../../models/contenedor.model';
import { ContenedorService } from '../../services/contenedor.service';

@Component({
  selector: 'app-contenedor-list',
  standalone: true,
  imports: [
    ButtonModule,
    ConfirmDialogModule,
    IconFieldModule,
    InputIconModule,
    InputTextModule,
    MenuModule,
    SkeletonModule,
    EmptyStateComponent,
    ErrorAlertComponent,
    InvitarDialogComponent,
    InvitacionesPendientesComponent,
  ],
  providers: [ConfirmationService],
  templateUrl: './contenedor-list.component.html',
  styleUrl: './contenedor-list.component.scss',
})
export class ContenedorListComponent {
  private readonly contenedorService = inject(ContenedorService);
  private readonly activeTenant = inject(ActiveTenantService);
  private readonly authService = inject(AuthService);
  private readonly apiKeyService = inject(ApiKeyService);
  private readonly router = inject(Router);
  private readonly toastService = inject(ToastService);
  private readonly confirmationService = inject(ConfirmationService);

  readonly currentUser = this.authService.currentUser;
  readonly activeTenantId = this.activeTenant.tenantId;

  readonly contenedores = signal<Contenedor[]>([]);
  readonly loading = signal(true);
  readonly errorMessage = signal<string | null>(null);
  readonly searchQuery = signal('');

  readonly skeletonItems = Array.from({ length: 4 });

  private readonly rowMenu = viewChild.required<Menu>('rowMenu');
  rowMenuItems: MenuItem[] = [];

  readonly invitarVisible = signal(false);
  readonly contenedorAInvitar = signal<Contenedor | null>(null);
  /** Membresía que se está abandonando; bloquea el engranaje de esa fila. */
  readonly saliendoId = signal<number | null>(null);

  readonly filteredContenedores = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    if (!query) return this.contenedores();
    return this.contenedores().filter((c) => this.nombre(c).toLowerCase().includes(query));
  });

  readonly summary = computed(() => {
    const total = this.contenedores().length;
    const activas = this.contenedores().filter((c) => c.activo).length;
    const empresas = total === 1 ? 'empresa' : 'empresas';
    return `${total} ${empresas} · ${activas} ${activas === 1 ? 'activa' : 'activas'}`;
  });

  constructor() {
    this.loadContenedores();
  }

  loadContenedores(): void {
    this.loading.set(true);
    this.errorMessage.set(null);
    this.contenedorService.getContenedores().subscribe({
      next: (contenedores) => {
        this.contenedores.set(contenedores);
        this.loading.set(false);
      },
      error: (err: unknown) => {
        this.errorMessage.set(extractErrorMessage(err, 'No se pudieron cargar tus empresas.'));
        this.loading.set(false);
      },
    });
  }

  /** Fija la empresa activa y entra al dashboard. */
  ingresar(contenedor: Contenedor): void {
    if (!contenedor.activo) return;
    this.activeTenant.set({ id: contenedor.tenant_id, nombre: this.nombre(contenedor) });
    this.router.navigateByUrl(ROUTE_PATHS.dashboard.root);
  }

  /** Solo el propietario de una membresía activa puede invitar. */
  puedeInvitar(contenedor: Contenedor): boolean {
    return contenedor.control && contenedor.activo;
  }

  /** Cualquier miembro puede salir; invitar queda para el propietario. */
  abrirMenu(event: Event, contenedor: Contenedor): void {
    const items: MenuItem[] = [];
    if (this.puedeInvitar(contenedor)) {
      items.push(
        {
          label: 'Invitar usuario',
          icon: 'pi pi-user-plus',
          command: () => this.abrirInvitar(contenedor),
        },
        { separator: true },
      );
    }
    items.push({
      label: 'Salir de la empresa',
      icon: 'pi pi-sign-out',
      styleClass: 'contenedor-menu__peligro',
      command: () => this.confirmarSalida(contenedor),
    });
    this.rowMenuItems = items;
    this.rowMenu().toggle(event);
  }

  onInvitarVisibleChange(visible: boolean): void {
    this.invitarVisible.set(visible);
    if (!visible) this.contenedorAInvitar.set(null);
  }

  private abrirInvitar(contenedor: Contenedor): void {
    this.contenedorAInvitar.set(contenedor);
    this.invitarVisible.set(true);
  }

  private confirmarSalida(contenedor: Contenedor): void {
    const nombre = this.nombre(contenedor);
    // Texto plano: el nombre de la empresa lo define otro usuario.
    const aviso = contenedor.control
      ? ' Eres propietario: si sales, la empresa podría quedar sin nadie que la administre.'
      : '';
    this.confirmationService.confirm({
      header: 'Salir de la empresa',
      message: `¿Salir de ${nombre}? Dejarás de ver sus datos y para volver necesitarás una nueva invitación.${aviso}`,
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Salir',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-danger',
      rejectButtonStyleClass: 'p-button-text p-button-secondary',
      accept: () => this.salir(contenedor),
    });
  }

  private salir(contenedor: Contenedor): void {
    const nombre = this.nombre(contenedor);
    this.saliendoId.set(contenedor.id);
    this.contenedorService.salir(contenedor.id).subscribe({
      next: () => {
        this.saliendoId.set(null);
        // Si era la empresa elegida, se suelta para que el dashboard no la siga usando.
        if (contenedor.tenant_id === this.activeTenantId()) this.activeTenant.clear();
        this.contenedores.update((lista) => lista.filter((c) => c.id !== contenedor.id));
        this.toastService.success('Saliste de la empresa', `Ya no tienes acceso a ${nombre}.`);
      },
      error: (err: unknown) => {
        this.saliendoId.set(null);
        // 0, 403, 429 y 500+ ya los avisa el interceptor.
        if (err instanceof HttpErrorResponse && [400, 404, 422].includes(err.status)) {
          this.toastService.error(
            'No se pudo salir',
            extractErrorMessage(err, 'Intenta de nuevo en un momento.'),
          );
          this.loadContenedores();
        }
      },
    });
  }

  nombre(contenedor: Contenedor): string {
    return contenedor.tenant_nombre?.trim() || `Empresa ${contenedor.tenant_id}`;
  }

  inicial(contenedor: Contenedor): string {
    return this.nombre(contenedor).charAt(0).toUpperCase();
  }

  logout(): void {
    this.apiKeyService.clearCache();
    this.authService.logout();
  }
}
