import { Component, computed, inject, signal, viewChild } from '@angular/core';
import { Router } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { Menu, MenuModule } from 'primeng/menu';
import { SkeletonModule } from 'primeng/skeleton';
import { ActiveTenantService, ROUTE_PATHS, extractErrorMessage } from '../../../../core';
import { EmptyStateComponent, ErrorAlertComponent } from '../../../../shared';
import { AuthService } from '../../../auth/services/auth.service';
import { ApiKeyService } from '../../../seguridad/services/api-key.service';
import { InvitarDialogComponent } from '../../components/invitar-dialog/invitar-dialog.component';
import { Contenedor } from '../../models/contenedor.model';
import { ContenedorService } from '../../services/contenedor.service';

@Component({
  selector: 'app-contenedor-list',
  standalone: true,
  imports: [
    ButtonModule,
    IconFieldModule,
    InputIconModule,
    InputTextModule,
    MenuModule,
    SkeletonModule,
    EmptyStateComponent,
    ErrorAlertComponent,
    InvitarDialogComponent,
  ],
  templateUrl: './contenedor-list.component.html',
  styleUrl: './contenedor-list.component.scss',
})
export class ContenedorListComponent {
  private readonly contenedorService = inject(ContenedorService);
  private readonly activeTenant = inject(ActiveTenantService);
  private readonly authService = inject(AuthService);
  private readonly apiKeyService = inject(ApiKeyService);
  private readonly router = inject(Router);

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

  /** La columna del engranaje solo se reserva si alguna empresa tiene acciones. */
  readonly hayAcciones = computed(() => this.contenedores().some((c) => this.tieneAcciones(c)));

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

  /** Solo el propietario de una membresía activa administra la empresa. */
  tieneAcciones(contenedor: Contenedor): boolean {
    return contenedor.control && contenedor.activo;
  }

  abrirMenu(event: Event, contenedor: Contenedor): void {
    this.rowMenuItems = [
      {
        label: 'Invitar usuario',
        icon: 'pi pi-user-plus',
        command: () => this.abrirInvitar(contenedor),
      },
    ];
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
