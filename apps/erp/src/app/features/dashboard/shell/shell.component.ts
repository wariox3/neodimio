import { Component, computed, inject, signal } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { DrawerModule } from 'primeng/drawer';
import { AuthService } from '../../auth/services/auth.service';
import { ApiKeyService } from '../../../features/seguridad/services/api-key.service';

interface NavChild {
  label: string;
  icon: string;
  route: string;
  roles?: string[];
}

interface NavGroup {
  label: string;
  icon: string;
  children: NavChild[];
  roles?: string[];
}

type NavItem = NavChild | NavGroup;

export function isNavGroup(item: NavItem): item is NavGroup {
  return 'children' in item;
}

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [NgTemplateOutlet, RouterOutlet, RouterLink, RouterLinkActive, DrawerModule],
  templateUrl: './shell.component.html',
  styleUrl: './shell.component.scss',
})
export class ShellComponent {
  private readonly authService = inject(AuthService);
  private readonly apiKeyService = inject(ApiKeyService);

  readonly currentUser = this.authService.currentUser;
  readonly drawerVisible = signal(false);

  /** Conjuntos de labels de grupos actualmente expandidos */
  readonly expandedGroups = signal<Set<string>>(new Set(['Seguridad', 'Configuración']));

  private readonly rawNavItems: NavItem[] = [
    {
      label: 'Inicio',
      icon: 'pi pi-home',
      route: '/dashboard/inicio',
    },
    {
      label: 'Seguridad',
      icon: 'pi pi-shield',
      children: [
        {
          label: 'Usuarios',
          icon: 'pi pi-users',
          route: '/dashboard/usuarios/lista',
          roles: ['admin'],
        },
        { label: 'API Keys', icon: 'pi pi-key', route: '/dashboard/seguridad/api-keys' },
      ],
    },
    {
      label: 'Configuración',
      icon: 'pi pi-cog',
      children: [{ label: 'Formatos', icon: 'pi pi-file', route: '/dashboard/formato/lista' }],
    },
  ];

  readonly navItems = computed(() => {
    const role = this.currentUser()?.role;
    const allowed = (item: NavChild | NavGroup) => !item.roles || item.roles.includes(role ?? '');
    return this.rawNavItems
      .filter(allowed)
      .map((item) =>
        isNavGroup(item) ? { ...item, children: item.children.filter(allowed) } : item,
      );
  });

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

  logout(): void {
    this.apiKeyService.clearCache();
    this.authService.logout();
  }
}
