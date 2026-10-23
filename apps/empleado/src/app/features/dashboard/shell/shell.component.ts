import { Component, computed, inject, signal } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { Router, RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { DrawerModule } from 'primeng/drawer';
import { MenuModule } from 'primeng/menu';
import { MenuItem } from 'primeng/api';
import { AuthService } from '../../auth/services/auth.service';
import { AsociarEmpresaDialogComponent } from '../components/asociar-empresa-dialog/asociar-empresa-dialog.component';
import { ROUTE_PATHS } from '../../../core/constants/route-paths.constants';

interface NavChild {
  label: string;
  icon: string;
  route: string;
  requiresTenant?: boolean;
  disabled?: boolean;
  disabledLabel?: string;
}

interface NavGroup {
  label: string;
  icon: string;
  children: NavChild[];
}

type NavItem = NavChild | NavGroup;

export function isNavGroup(item: NavItem): item is NavGroup {
  return 'children' in item;
}

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [
    NgTemplateOutlet,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    DrawerModule,
    MenuModule,
    AsociarEmpresaDialogComponent,
  ],
  templateUrl: './shell.component.html',
  styleUrl: './shell.component.scss',
})
export class ShellComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly currentUser = this.authService.currentUser;
  readonly hasTenant = this.authService.hasTenant;
  readonly drawerVisible = signal(false);
  readonly dialogVisible = signal(false);

  readonly avatarLabel = computed(() => {
    const user = this.currentUser();
    if (!user) return '';
    const name = user.name?.trim();
    return (name ? name.charAt(0) : user.email.charAt(0)).toUpperCase();
  });

  readonly userMenuItems: MenuItem[] = [
    {
      label: 'Mi perfil',
      icon: 'pi pi-user',
      command: () => this.router.navigate([ROUTE_PATHS.dashboard.perfil]),
    },
    { separator: true },
    {
      label: 'Cerrar sesión',
      icon: 'pi pi-sign-out',
      command: () => this.logout(),
    },
  ];

  /** Conjuntos de labels de grupos actualmente expandidos */
  readonly expandedGroups = signal<Set<string>>(new Set(['Consultas', 'Utilidades', 'Finanzas']));

  readonly navItems: NavItem[] = [
    {
      label: 'Inicio',
      icon: 'pi pi-home',
      route: ROUTE_PATHS.dashboard.inicio,
    },
    {
      label: 'Consultas',
      icon: 'pi pi-search',
      children: [
        {
          label: 'Pagos',
          icon: 'pi pi-credit-card',
          route: ROUTE_PATHS.dashboard.pagos,
          requiresTenant: true,
        },
        {
          label: 'Reclamos',
          icon: 'pi pi-exclamation-triangle',
          route: ROUTE_PATHS.dashboard.reclamos,
          requiresTenant: true,
        },
        {
          label: 'Solicitudes',
          icon: 'pi pi-file',
          route: ROUTE_PATHS.dashboard.solicitudes,
          requiresTenant: true,
        },
        {
          label: 'Capacitaciones',
          icon: 'pi pi-book',
          route: ROUTE_PATHS.dashboard.capacitaciones,
          requiresTenant: true,
        },
        {
          label: 'Certificado laboral',
          icon: 'pi pi-id-card',
          route: ROUTE_PATHS.dashboard.certificadoLaboral,
          requiresTenant: true,
        },
        {
          label: 'Turnos',
          icon: 'pi pi-calendar',
          route: ROUTE_PATHS.dashboard.turnos,
          requiresTenant: true,
        },
        {
          label: 'Programaciones',
          icon: 'pi pi-table',
          route: ROUTE_PATHS.dashboard.programaciones,
          requiresTenant: true,
        },
        {
          label: 'Reportes programación',
          icon: 'pi pi-file-edit',
          route: ROUTE_PATHS.dashboard.reportesProgramacion,
          requiresTenant: true,
        },
      ],
    },
    {
      label: 'Utilidades',
      icon: 'pi pi-wrench',
      children: [
        {
          label: 'Actualizar información',
          icon: 'pi pi-user-edit',
          route: ROUTE_PATHS.dashboard.actualizarInformacion,
          requiresTenant: true,
        },
      ],
    },
    {
      label: 'Finanzas',
      icon: 'pi pi-wallet',
      children: [
        {
          label: 'Créditos',
          icon: 'pi pi-money-bill',
          route: ROUTE_PATHS.dashboard.creditos,
          requiresTenant: true,
          disabled: true,
        },
        {
          label: 'Anticipo de nómina',
          icon: 'pi pi-dollar',
          route: ROUTE_PATHS.dashboard.anticipoNomina,
          requiresTenant: true,
        },
      ],
    },
  ];

  readonly isNavGroup = isNavGroup;

  isExpanded(label: string): boolean {
    return this.expandedGroups().has(label);
  }

  toggleGroup(label: string): void {
    this.expandedGroups.update((set) => {
      const next = new Set(set);
      if (next.has(label)) {
        next.delete(label);
      } else {
        next.add(label);
      }
      return next;
    });
  }

  toggleDrawer(): void {
    this.drawerVisible.update((v) => !v);
  }

  openDialog(): void {
    this.dialogVisible.set(true);
  }

  logout(): void {
    this.authService.logout();
  }
}
