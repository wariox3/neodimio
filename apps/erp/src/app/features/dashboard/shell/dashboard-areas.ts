import { ROUTE_PATHS } from '../../../core';

/** Área del dashboard; la declara cada ruta en `data.area`. */
export type DashboardArea = 'inicio' | 'empresa' | 'seguridad' | 'configuracion' | 'transporte';

/** Opción navegable dentro de un acordeón. */
export interface NavLeaf {
  label: string;
  route: string;
  /** Roles globales que pueden verlo; sin roles, todos. */
  roles?: string[];
}

/** Opción de primer nivel del menú lateral. */
export interface NavItem extends NavLeaf {
  icon: string;
}

/** Grupo desplegable de opciones del menú lateral. */
export interface NavAccordion {
  id: string;
  label: string;
  icon: string;
  children: NavLeaf[];
}

export type NavEntry = NavItem | NavAccordion;

export function isNavAccordion(entry: NavEntry): entry is NavAccordion {
  return 'children' in entry;
}

export interface DashboardAreaConfig {
  /** Título del menú lateral; sin título no se muestra el encabezado. */
  title?: string;
  icon?: string;
  /** Opciones del menú lateral; vacío oculta el menú. */
  items: NavEntry[];
}

/** Módulo de negocio: un área con acceso propio desde la barra superior. */
export interface DashboardModule {
  area: DashboardArea;
  label: string;
  icon: string;
  route: string;
}

/** Módulos de la barra superior, en el orden en que se muestran. */
export const DASHBOARD_MODULES: readonly DashboardModule[] = [
  {
    area: 'transporte',
    label: 'Transporte',
    icon: 'pi pi-truck',
    route: ROUTE_PATHS.dashboard.transporte.root,
  },
];

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
      { label: 'Usuarios', icon: 'pi pi-users', route: ROUTE_PATHS.dashboard.seguridad.usuarios },
      {
        label: 'Invitaciones',
        icon: 'pi pi-envelope',
        route: ROUTE_PATHS.dashboard.seguridad.invitaciones,
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
  transporte: {
    items: [
      { label: 'Inicio', icon: 'pi pi-home', route: ROUTE_PATHS.dashboard.transporte.inicio },
      {
        id: 'transporte-administradores',
        label: 'Administradores',
        icon: 'pi pi-folder',
        children: [{ label: 'Guía', route: ROUTE_PATHS.dashboard.transporte.guias }],
      },
    ],
  },
};
