import { tieneNovedadAbierta } from '@semantica/core';
import { GuiaDetalle } from '../guia.model';

export { getEstadoGuia, tieneNovedadAbierta } from '@semantica/core';

export interface IndicadorGuia {
  label: string;
  activo: boolean;
  /** Marca de alerta (novedad abierta o guía anulada). */
  alerta?: boolean;
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
