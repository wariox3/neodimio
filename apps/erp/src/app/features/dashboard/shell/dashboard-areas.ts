import { ROUTE_PATHS } from '../../../core';

/** Área del dashboard; la declara cada ruta en `data.area`. */
export type DashboardArea = 'inicio' | 'empresa' | 'seguridad' | 'configuracion';

export interface NavItem {
  label: string;
  icon: string;
  route: string;
  /** Roles globales que pueden verlo; sin roles, todos. */
  roles?: string[];
}

export interface DashboardAreaConfig {
  /** Título del menú lateral; sin título no se muestra el encabezado. */
  title?: string;
  icon?: string;
  /** Opciones del menú lateral; vacío oculta el menú. */
  items: NavItem[];
}

/** Menú lateral de cada área del dashboard. */
export const DASHBOARD_AREAS: Record<DashboardArea, DashboardAreaConfig> = {
  inicio: {
    items: [{ label: 'Inicio', icon: 'pi pi-home', route: ROUTE_PATHS.dashboard.inicio }],
  },
  empresa: {
    items: [],
  },
  seguridad: {
    title: 'Seguridad',
    icon: 'pi pi-shield',
    items: [
      {
        label: 'Usuarios',
        icon: 'pi pi-users',
        route: ROUTE_PATHS.dashboard.seguridad.usuarios,
        roles: ['admin'],
      },
      { label: 'API Keys', icon: 'pi pi-key', route: ROUTE_PATHS.dashboard.seguridad.apiKeys },
    ],
  },
  configuracion: {
    title: 'Configuración',
    icon: 'pi pi-cog',
    items: [
      {
        label: 'Formatos',
        icon: 'pi pi-file',
        route: ROUTE_PATHS.dashboard.configuracion.formatos,
      },
    ],
  },
};
