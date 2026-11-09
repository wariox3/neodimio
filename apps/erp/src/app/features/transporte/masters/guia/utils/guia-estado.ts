import { Guia, GuiaDetalle } from '../guia.model';

export type EstadoSeverity = 'success' | 'info' | 'warn' | 'secondary' | 'contrast' | 'danger';

export interface EstadoGuia {
  label: string;
  severity: EstadoSeverity;
}

export interface IndicadorGuia {
  label: string;
  activo: boolean;
  /** Marca de alerta (novedad abierta o guía anulada). */
  alerta?: boolean;
}

/**
 * Estado más avanzado de la guía, para mostrarlo como un solo tag.
 * Solo el detalle trae `estado_anulado`; en el listado una guía anulada no se distingue.
 */
export function getEstadoGuia(guia: Guia | GuiaDetalle): EstadoGuia {
  if ('estado_anulado' in guia && guia.estado_anulado) {
    return { label: 'Anulada', severity: 'danger' };
  }
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

/** Banderas del detalle que no aparecen en la línea de tiempo de seguimiento. */
export function getIndicadoresGuia(guia: GuiaDetalle): IndicadorGuia[] {
  return [
    { label: 'Anulada', activo: guia.estado_anulado, alerta: guia.estado_anulado },
    { label: 'Novedad', activo: guia.estado_novedad, alerta: tieneNovedadAbierta(guia) },
    { label: 'Novedad solucionada', activo: guia.estado_novedad_solucion },
    { label: 'Impresa', activo: guia.estado_impreso },
    { label: 'Embarcada', activo: guia.estado_embarcado },
    { label: 'Soporte', activo: guia.estado_soporte },
    { label: 'Facturada', activo: guia.estado_facturado },
    { label: 'Factura generada', activo: guia.estado_factura_generada },
    { label: 'Devolución', activo: guia.estado_devolucion },
    { label: 'Se factura', activo: guia.factura },
    { label: 'Cortesía', activo: guia.cortesia },
    { label: 'Corrección', activo: guia.correccion },
    { label: 'Reexpedición', activo: guia.reexpedicion },
    { label: 'Devolver documento', activo: guia.devolver_documento_cliente },
    { label: 'Mercancía peligrosa', activo: guia.mercancia_peligrosa === true },
    { label: 'Contenido verificado', activo: guia.contenido_verificado === true },
  ];
}
