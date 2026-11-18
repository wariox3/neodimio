import { Guia } from './guia.model';

export type EstadoSeverity = 'success' | 'info' | 'warn' | 'secondary' | 'contrast' | 'danger';

export interface EstadoGuia {
  readonly label: string;
  readonly severity: EstadoSeverity;
}

/**
 * Estado más avanzado de la guía, para mostrarlo como un solo tag.
 * Solo el detalle trae `estado_anulado`; en el listado una guía anulada no se distingue.
 */
export function getEstadoGuia(guia: Guia & { readonly estado_anulado?: boolean }): EstadoGuia {
  if (guia.estado_anulado) return { label: 'Anulada', severity: 'danger' };
  if (guia.estado_cumplido) return { label: 'Cumplida', severity: 'success' };
  if (guia.estado_entregado) return { label: 'Entregada', severity: 'success' };
  if (guia.estado_despachado) return { label: 'Despachada', severity: 'info' };
  if (guia.estado_ingreso) return { label: 'En bodega', severity: 'warn' };
  if (guia.estado_recogido) return { label: 'Recogida', severity: 'warn' };
  return { label: 'Pendiente', severity: 'contrast' };
}

/** La guía tiene una novedad sin solucionar. */
export function tieneNovedadAbierta(guia: Guia): boolean {
  return guia.estado_novedad && !guia.estado_novedad_solucion;
}
