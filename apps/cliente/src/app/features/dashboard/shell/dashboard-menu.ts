import { ROUTE_PATHS } from '../../../core';

export interface NavItem {
  label: string;
  route: string;
}

/** Grupo desplegable del menú, equivalente a un `nav-parent` de terbio. */
export interface NavGroup {
  label: string;
  icon: string;
  items: NavItem[];
  /**
   * Oculta el grupo sin quitarlo de la configuración. Queda para los permisos de menú
   * por empresa de terbio (`menuGeneral`, `menuCrm`…), que fluor aún no expone.
   */
  oculto?: boolean;
}

const R = ROUTE_PATHS.dashboard;

/**
 * Menú lateral del portal de clientes. Replica los grupos, el orden y los
 * nombres del apartado "Clientes" de terbio
 * (`templates/aplicacion/componentes/menu.html.twig`).
 */
export const DASHBOARD_MENU: NavGroup[] = [
  {
    label: 'General',
    icon: 'pi pi-info-circle',
    items: [{ label: 'Información', route: R.general.informacion }],
  },
  {
    label: 'CRM',
    icon: 'pi pi-briefcase',
    items: [
      { label: 'Visita', route: R.crm.visitas },
      { label: 'Cotización', route: R.crm.cotizaciones },
      { label: 'PQRS', route: R.crm.pqrs },
    ],
  },
  {
    label: 'Operación',
    icon: 'pi pi-cog',
    items: [{ label: 'Consigna', route: R.operacion.consignas }],
  },
  {
    label: 'Programación',
    icon: 'pi pi-calendar',
    items: [{ label: 'Empleados', route: R.programacion.empleados }],
  },
  {
    label: 'Ventas',
    icon: 'pi pi-shopping-cart',
    items: [{ label: 'Facturas', route: R.venta.facturas }],
  },
  {
    label: 'Cartera',
    icon: 'pi pi-wallet',
    items: [
      { label: 'Pendientes', route: R.cartera.pendientes },
      { label: 'Recibos', route: R.cartera.recibos },
    ],
  },
  {
    label: 'Recurso humano',
    icon: 'pi pi-users',
    items: [
      { label: 'Autorización arma', route: R.recursoHumano.autorizacionArma },
      { label: 'Seguridad social', route: R.recursoHumano.seguridadSocial },
    ],
  },
  {
    label: 'Transporte',
    icon: 'pi pi-box',
    items: [
      { label: 'Guía', route: R.transporte.guias },
      { label: 'Novedad', route: R.transporte.novedades },
      { label: 'Destinatario', route: R.transporte.destinatarios },
    ],
  },
  {
    // En terbio solo lo ve quien tiene `gestionTranporte`; fluor aún no expone ese permiso.
    label: 'Gestión logística',
    icon: 'pi pi-truck',
    items: [
      { label: 'Despacho', route: R.gestionLogistica.despachos },
      { label: 'Soporte', route: R.gestionLogistica.soporte },
      { label: 'Redespacho', route: R.gestionLogistica.redespacho },
    ],
  },
];
