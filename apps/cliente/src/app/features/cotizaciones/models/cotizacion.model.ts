/** Cotización del cliente (`CotizacionPortalResponse` de fluor, módulo CRM). */
export interface Cotizacion {
  codigo_cotizacion_pk: number;
  numero: number | null;
  fecha: string | null;
  vencimiento: string | null;
  codigo_cotizacion_tipo_fk: string | null;
  cotizacion_tipo_nombre: string | null;
  codigo_tercero_fk: number | null;
  tercero_nombre_corto: string | null;
  codigo_asesor_fk: number | null;
  asesor_nombre: string | null;
  codigo_forma_pago_fk: string | null;
  forma_pago_nombre: string | null;
  codigo_negocio_fk: number | null;
  negocio_nombre: string | null;
  vr_subtotal: number;
  vr_iva: number;
  vr_neto: number;
  vr_total: number;
  estado_autorizado: boolean | null;
  estado_aprobado: boolean | null;
  estado_anulado: boolean | null;
}

/** Estado de la cotización para mostrar en una sola etiqueta. */
export interface EstadoCotizacion {
  label: string;
  severity: 'success' | 'info' | 'danger' | 'secondary';
}

/**
 * Resume los estados de holmio, que terbio mostraba en tres columnas (AUT, APR, ANU):
 * la anulación prevalece, luego la aprobación y luego la autorización.
 */
export function estadoCotizacion(
  cotizacion: Pick<Cotizacion, 'estado_autorizado' | 'estado_aprobado' | 'estado_anulado'>,
): EstadoCotizacion {
  if (cotizacion.estado_anulado) return { label: 'Anulada', severity: 'danger' };
  if (cotizacion.estado_aprobado) return { label: 'Aprobada', severity: 'success' };
  if (cotizacion.estado_autorizado) return { label: 'Autorizada', severity: 'info' };
  return { label: 'Pendiente', severity: 'secondary' };
}

/** Negocio con su código, como en terbio (`12 - Nombre`). */
export function negocioCotizacion(
  cotizacion: Pick<Cotizacion, 'codigo_negocio_fk' | 'negocio_nombre'>,
): string {
  if (cotizacion.codigo_negocio_fk === null) return cotizacion.negocio_nombre ?? '—';
  return cotizacion.negocio_nombre
    ? `${cotizacion.codigo_negocio_fk} - ${cotizacion.negocio_nombre}`
    : String(cotizacion.codigo_negocio_fk);
}
