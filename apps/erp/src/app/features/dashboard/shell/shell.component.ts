import { Component, computed, inject, signal } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import {
  ActivatedRouteSnapshot,
  NavigationEnd,
  Router,
  RouterOutlet,
  RouterLink,
  RouterLinkActive,
} from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, map } from 'rxjs';
import { DrawerModule } from 'primeng/drawer';
import { ROUTE_PATHS } from '../../../core';
import { AuthService } from '../../auth/services/auth.service';
import { UserMenuComponent } from '../../../shared/user-menu/user-menu.component';
import { DASHBOARD_AREAS, DashboardArea } from './dashboard-areas';

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
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly drawerVisible = signal(false);
  readonly inicioRoute = ROUTE_PATHS.dashboard.inicio;

  /** Área de la ruta activa: la última `data.area` declarada en el árbol de rutas. */
  readonly area = toSignal(
    this.router.events.pipe(
      filter((e) => e instanceof NavigationEnd),
      map(() => this.resolveArea()),
    ),
    { initialValue: this.resolveArea() },
  );

  readonly areaConfig = computed(() => DASHBOARD_AREAS[this.area()]);

  /** Opciones del área filtradas por el rol global del usuario. */
  readonly navItems = computed(() => {
    const role = this.authService.currentUser()?.role ?? '';
    return this.areaConfig().items.filter((item) => !item.roles || item.roles.includes(role));
  });

  readonly hasSidebar = computed(() => this.navItems().length > 0);

  /** Fuera de Inicio, el menú lateral ofrece volver. */
  readonly showBack = computed(() => this.area() !== 'inicio');

  toggleDrawer(): void {
    this.drawerVisible.update((v) => !v);
  }

  private resolveArea(): DashboardArea {
    let area: DashboardArea = 'inicio';
    let route: ActivatedRouteSnapshot | null = this.router.routerState.snapshot.root;
    while (route) {
      const declared = route.data['area'] as DashboardArea | undefined;
      if (declared) area = declared;
      route = route.firstChild;
    }
    return area;
  }
}
