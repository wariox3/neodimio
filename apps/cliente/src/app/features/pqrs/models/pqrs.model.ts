/** PQRS del cliente (`SolicitudPortalResponse` de fluor, módulo CRM). */
export interface Pqrs {
  codigo_solicitud_pk: number;
  descripcion: string | null;
  codigo_solicitud_tipo_fk: string | null;
  solicitud_tipo_nombre: string | null;
  codigo_tercero_fk: number | null;
  tercero_nombre_corto: string | null;
  codigo_canal_fk: string | null;
  canal_nombre: string | null;
  fecha: string | null;
  fecha_registro: string | null;
  fecha_vencimiento: string | null;
  fecha_respuesta: string | null;
  fecha_cierre: string | null;
  estado_autorizado: boolean;
  estado_aprobado: boolean;
  estado_anulado: boolean;
  estado_cerrado: boolean;
}

/** Estado de la PQRS para mostrar en una sola etiqueta. */
export interface EstadoPqrs {
  label: string;
  severity: 'success' | 'info' | 'warn' | 'danger' | 'secondary';
}

/**
 * Resume los estados de holmio, que terbio mostraba en cuatro columnas (AUT, APR, ANU, CER):
 * la anulación prevalece, luego el cierre, la aprobación y la autorización.
 */
export function estadoPqrs(
  pqrs: Pick<Pqrs, 'estado_autorizado' | 'estado_aprobado' | 'estado_anulado' | 'estado_cerrado'>,
): EstadoPqrs {
  if (pqrs.estado_anulado) return { label: 'Anulada', severity: 'danger' };
  if (pqrs.estado_cerrado) return { label: 'Cerrada', severity: 'success' };
  if (pqrs.estado_aprobado) return { label: 'Aprobada', severity: 'info' };
  if (pqrs.estado_autorizado) return { label: 'Autorizada', severity: 'warn' };
  return { label: 'Pendiente', severity: 'secondary' };
}
