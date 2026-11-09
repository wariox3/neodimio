import { Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { SkeletonModule } from 'primeng/skeleton';
import { ActiveTenantService, ROUTE_PATHS, extractErrorMessage } from '../../../../core';
import { EmptyStateComponent, ErrorAlertComponent } from '../../../../shared';
import { UserMenuComponent } from '../../../../shared/user-menu/user-menu.component';
import { Contenedor, puedeIngresar } from '../../models/contenedor.model';
import { ContenedorService } from '../../services/contenedor.service';

/**
 * Selección de empresa: lista las empresas del usuario y, al elegir una,
 * la fija como activa (cabecera `X-Tenant-ID`) y entra al dashboard.
 */
@Component({
  selector: 'app-contenedor-list',
  standalone: true,
  imports: [
    IconFieldModule,
    InputIconModule,
    InputTextModule,
    SkeletonModule,
    EmptyStateComponent,
    ErrorAlertComponent,
    UserMenuComponent,
  ],
  templateUrl: './contenedor-list.component.html',
  styleUrl: './contenedor-list.component.scss',
})
export class ContenedorListComponent {
  private readonly contenedorService = inject(ContenedorService);
  private readonly activeTenant = inject(ActiveTenantService);
  private readonly router = inject(Router);

  readonly contenedores = signal<Contenedor[]>([]);
  readonly loading = signal(true);
  readonly errorMessage = signal<string | null>(null);
  readonly searchQuery = signal('');

  readonly skeletonItems = Array.from({ length: 4 });
  readonly puedeIngresar = puedeIngresar;

  readonly filteredContenedores = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    if (!query) return this.contenedores();
    return this.contenedores().filter((c) => this.nombre(c).toLowerCase().includes(query));
  });

  readonly summary = computed(() => {
    const total = this.contenedores().length;
    const disponibles = this.contenedores().filter(puedeIngresar).length;
    const empresas = total === 1 ? 'empresa' : 'empresas';
    return `${total} ${empresas} · ${disponibles} ${disponibles === 1 ? 'disponible' : 'disponibles'}`;
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
    if (!puedeIngresar(contenedor)) return;
    this.activeTenant.set({
      id: contenedor.tenant_id,
      nombre: this.nombre(contenedor),
      propietario: contenedor.control,
    });
    this.router.navigateByUrl(ROUTE_PATHS.dashboard.root);
  }

  nombre(contenedor: Contenedor): string {
    return contenedor.tenant_nombre?.trim() || `Empresa ${contenedor.tenant_id}`;
  }

  inicial(contenedor: Contenedor): string {
    return this.nombre(contenedor).charAt(0).toUpperCase();
  }
}
