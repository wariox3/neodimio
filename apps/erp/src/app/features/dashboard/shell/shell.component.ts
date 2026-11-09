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
import {
  DASHBOARD_AREAS,
  DASHBOARD_MODULES,
  DashboardArea,
  NavAccordion,
  NavEntry,
  NavLeaf,
  isNavAccordion,
} from './dashboard-areas';

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
  readonly modules = DASHBOARD_MODULES;

  /** Acordeones que la persona cerró; todos arrancan abiertos. */
  private readonly closedAccordions = signal<ReadonlySet<string>>(new Set());

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
  readonly navEntries = computed<NavEntry[]>(() => {
    const role = this.authService.currentUser()?.role ?? '';
    const allowed = (leaf: NavLeaf) => !leaf.roles || leaf.roles.includes(role);

    return this.areaConfig().items.flatMap((entry): NavEntry[] => {
      if (!isNavAccordion(entry)) return allowed(entry) ? [entry] : [];
      const children = entry.children.filter(allowed);
      return children.length > 0 ? [{ ...entry, children }] : [];
    });
  });

  readonly hasSidebar = computed(() => this.navEntries().length > 0);

  /** Fuera de Inicio y de los módulos, que ya tienen la barra superior, se ofrece volver. */
  readonly showBack = computed(
    () => this.area() !== 'inicio' && !this.modules.some((m) => m.area === this.area()),
  );

  isAccordion(entry: NavEntry): entry is NavAccordion {
    return isNavAccordion(entry);
  }

  isExpanded(id: string): boolean {
    return !this.closedAccordions().has(id);
  }

  toggleAccordion(id: string): void {
    this.closedAccordions.update((closed) => {
      const next = new Set(closed);
      if (!next.delete(id)) next.add(id);
      return next;
    });
  }

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
