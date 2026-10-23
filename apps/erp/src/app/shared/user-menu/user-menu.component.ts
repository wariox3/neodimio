import { Component, computed, effect, inject, untracked, viewChild } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, map } from 'rxjs';
import { MenuItem } from 'primeng/api';
import { Menu, MenuModule } from 'primeng/menu';
import { ActiveTenantService, ROUTE_PATHS } from '../../core';
import { AuthService } from '../../features/auth/services/auth.service';
import { PerfilService } from '../../features/auth/services/perfil.service';
import { ApiKeyService } from '../../features/seguridad/services/api-key.service';

/**
 * Menú desplegable del usuario en la barra superior: muestra quién está
 * conectado y la empresa activa, y reúne "Mis contenedores" y "Cerrar sesión".
 */
@Component({
  selector: 'app-user-menu',
  standalone: true,
  imports: [MenuModule],
  templateUrl: './user-menu.component.html',
  styleUrl: './user-menu.component.scss',
})
export class UserMenuComponent {
  private readonly authService = inject(AuthService);
  private readonly perfilService = inject(PerfilService);
  private readonly apiKeyService = inject(ApiKeyService);
  private readonly router = inject(Router);

  private readonly menu = viewChild.required<Menu>('menu');

  private readonly activeTenantService = inject(ActiveTenantService);
  readonly activeTenant = this.activeTenantService.tenant;
  private readonly esPropietario = this.activeTenantService.isPropietario;
  readonly email = computed(() => this.authService.currentUser()?.email ?? '');

  /** Nombre completo del perfil; sin nombre cargado, el correo. */
  readonly displayName = computed(() => {
    const user = this.authService.currentUser();
    const cache = this.perfilService.cache();
    if (!user) return '';
    if (cache?.usuarioId === user.id) {
      const { nombres, apellidos } = cache.perfil;
      const nombre = `${nombres ?? ''} ${apellidos ?? ''}`.trim();
      if (nombre) return nombre;
    }
    return user.email;
  });

  readonly initials = computed(() => {
    const name = this.displayName();
    if (!name) return '';
    if (name.includes('@')) return name.charAt(0).toUpperCase();
    return name
      .split(/\s+/)
      .slice(0, 2)
      .map((parte) => parte.charAt(0).toUpperCase())
      .join('');
  });

  private readonly currentUrl = toSignal(
    this.router.events.pipe(
      filter((e): e is NavigationEnd => e instanceof NavigationEnd),
      map((e) => e.urlAfterRedirects),
    ),
    { initialValue: this.router.url },
  );

  /** En la lista de contenedores no tiene sentido ofrecer volver a ella. */
  private readonly enContenedores = computed(() =>
    this.currentUrl().startsWith(ROUTE_PATHS.contenedores.root),
  );

  /**
   * Opciones sobre la empresa activa. Sin empresa (en la lista de contenedores)
   * no hay a dónde llevarlas, así que el grupo entero desaparece. Todas son
   * del propietario; las mismas reglas aplican sus rutas.
   */
  private readonly empresaItems = computed<MenuItem[]>(() => {
    if (!this.activeTenant() || !this.esPropietario()) return [];
    return [
      {
        label: 'Mi empresa',
        icon: 'pi pi-building',
        command: () => this.router.navigateByUrl(ROUTE_PATHS.dashboard.empresa),
      },
      {
        label: 'Seguridad',
        icon: 'pi pi-shield',
        command: () => this.router.navigateByUrl(ROUTE_PATHS.dashboard.seguridad.root),
      },
      {
        label: 'Configuración',
        icon: 'pi pi-cog',
        command: () => this.router.navigateByUrl(ROUTE_PATHS.dashboard.configuracion.root),
      },
    ];
  });

  readonly items = computed<MenuItem[]>(() => [
    ...(this.enContenedores()
      ? []
      : [
          {
            label: 'Mis contenedores',
            icon: 'pi pi-th-large',
            command: () => this.router.navigateByUrl(ROUTE_PATHS.contenedores.root),
          },
          { separator: true },
        ]),
    // El separador del grupo viaja con él: sin opciones, no se dibuja.
    ...(this.empresaItems().length > 0 ? [...this.empresaItems(), { separator: true }] : []),
    {
      label: 'Cerrar sesión',
      icon: 'pi pi-sign-out',
      command: () => this.logout(),
    },
  ]);

  constructor() {
    // Carga el nombre una vez por usuario; un fallo deja el correo como nombre.
    effect(() => {
      const userId = this.authService.currentUser()?.id;
      if (userId == null) return;
      untracked(() => {
        if (this.perfilService.cache()?.usuarioId === userId) return;
        this.perfilService.cargar(userId).subscribe({ error: () => undefined });
      });
    });
  }

  toggle(event: Event): void {
    this.menu().toggle(event);
  }

  private logout(): void {
    this.apiKeyService.clearCache();
    this.authService.logout();
  }
}
