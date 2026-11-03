import { Component, computed, inject, viewChild } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, map } from 'rxjs';
import { MenuItem } from 'primeng/api';
import { Menu, MenuModule } from 'primeng/menu';
import { ActiveTenantService, ROUTE_PATHS } from '../../core';
import { AuthService } from '../../features/auth/services/auth.service';

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
  private readonly router = inject(Router);

  private readonly menu = viewChild.required<Menu>('menu');

  readonly activeTenant = inject(ActiveTenantService).tenant;

  readonly email = computed(() => this.authService.currentUser()?.email ?? '');

  /** Nombre completo del usuario; sin nombre, el correo. */
  readonly displayName = computed(() => {
    const user = this.authService.currentUser();
    if (!user) return '';
    const nombre = `${user.nombres ?? ''} ${user.apellidos ?? ''}`.trim();
    return nombre || user.email;
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
    {
      label: 'Cerrar sesión',
      icon: 'pi pi-sign-out',
      command: () => this.authService.logout(),
    },
  ]);

  toggle(event: Event): void {
    this.menu().toggle(event);
  }
}
