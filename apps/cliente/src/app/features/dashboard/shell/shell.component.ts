import { Component, effect, signal, inject } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { NavigationEnd, Router, RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, map } from 'rxjs';
import { DrawerModule } from 'primeng/drawer';
import { ActiveTenantService, ROUTE_PATHS } from '../../../core';
import { UserMenuComponent } from '../../../shared/user-menu/user-menu.component';
import { DASHBOARD_MENU, NavGroup } from './dashboard-menu';

/**
 * Layout del dashboard: barra superior con logo, contenedor activo y menú de usuario, menú lateral
 * fijo en escritorio y drawer en móvil. El menú se organiza en grupos
 * desplegables, como en terbio.
 */
@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [
    NgTemplateOutlet,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    DrawerModule,
    UserMenuComponent,
  ],
  templateUrl: './shell.component.html',
  styleUrl: './shell.component.scss',
})
export class ShellComponent {
  private readonly router = inject(Router);

  readonly drawerVisible = signal(false);
  readonly inicioRoute = ROUTE_PATHS.dashboard.inicio;
  readonly contenedoresRoute = ROUTE_PATHS.contenedores.root;
  /** Empresa en la que está trabajando el usuario, visible siempre en la barra superior. */
  readonly activeTenant = inject(ActiveTenantService).tenant;
  readonly groups = DASHBOARD_MENU.filter((group) => !group.oculto);

  /** Grupos desplegados, por etiqueta. */
  readonly expanded = signal<ReadonlySet<string>>(new Set());

  private readonly currentUrl = toSignal(
    this.router.events.pipe(
      filter((e): e is NavigationEnd => e instanceof NavigationEnd),
      map((e) => e.urlAfterRedirects),
    ),
    { initialValue: this.router.url },
  );

  constructor() {
    // Al navegar, despliega el grupo que contiene la opción activa.
    effect(() => {
      const url = this.currentUrl();
      const group = this.groups.find((g) => this.containsUrl(g, url));
      if (group && !this.expanded().has(group.label)) {
        this.expanded.update((set) => new Set(set).add(group.label));
      }
    });
  }

  toggleDrawer(): void {
    this.drawerVisible.update((v) => !v);
  }

  toggleGroup(group: NavGroup): void {
    this.expanded.update((set) => {
      const next = new Set(set);
      if (!next.delete(group.label)) next.add(group.label);
      return next;
    });
  }

  isGroupActive(group: NavGroup): boolean {
    return this.containsUrl(group, this.currentUrl());
  }

  private containsUrl(group: NavGroup, url: string): boolean {
    return group.items.some((item) => url.startsWith(item.route));
  }
}
