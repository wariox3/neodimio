import { tieneNovedadAbierta } from '@semantica/core';
import { Guia, GuiaDetalle } from '../models/guia.model';

export { getEstadoGuia, tieneNovedadAbierta } from '@semantica/core';

export interface IndicadorGuia {
  label: string;
  activo: boolean;
  /** Marca de alerta (novedad abierta o guía anulada). */
  alerta?: boolean;
  /** Fecha asociada al estado, si la hay. */
  fecha?: string | null;
}

/** Banderas de estado que trae la lista de fluor. */
export function getIndicadoresGuia(guia: Guia): IndicadorGuia[] {
  return [
    { label: 'Recogida', activo: guia.estado_recogido, fecha: guia.fecha_recogido },
    { label: 'Ingreso a bodega', activo: guia.estado_ingreso },
    { label: 'Despachada', activo: guia.estado_despachado, fecha: guia.fecha_despacho },
    { label: 'Entregada', activo: guia.estado_entregado, fecha: guia.fecha_entrega },
    { label: 'Cumplida', activo: guia.estado_cumplido, fecha: guia.fecha_cumplido },
    { label: 'Novedad', activo: guia.estado_novedad, alerta: tieneNovedadAbierta(guia) },
    { label: 'Novedad solucionada', activo: guia.estado_novedad_solucion },
  ];
}

/** Banderas del detalle: las de la lista más soporte, facturación y anulación. */
export function getIndicadoresDetalle(guia: GuiaDetalle): IndicadorGuia[] {
  return [
    ...getIndicadoresGuia(guia),
    { label: 'Soporte', activo: guia.estado_soporte, fecha: guia.fecha_soporte },
    { label: 'Facturada', activo: guia.estado_facturado, fecha: guia.fecha_factura },
    { label: 'Devolución', activo: guia.estado_devolucion },
    { label: 'Anulada', activo: guia.estado_anulado, alerta: guia.estado_anulado },
  ];
}
