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

/** Tipo de PQRS que el cliente puede registrar desde el portal (`SolicitudTipoPortalResponse`). */
export interface PqrsTipo {
  codigo_solicitud_tipo_pk: string;
  nombre: string;
}

/**
 * PQRS nueva del cliente (`SolicitudPortalNuevoRequest`). fluor toma el tercero de la
 * membresía y registra el portal como canal.
 */
export interface PqrsNuevaRequest {
  codigo_solicitud_tipo_fk: string;
  descripcion: string;
  nombre_contacto: string | null;
  numero_identificacion_contacto: string | null;
  telefono_contacto: string | null;
  correo_contacto: string | null;
  cargo_contacto: string | null;
}

/** Longitudes máximas que acepta fluor (columnas de `crm_solicitud`). */
export const PQRS_MAX_LENGTH = {
  descripcion: 5000,
  nombre_contacto: 80,
  numero_identificacion_contacto: 80,
  telefono_contacto: 50,
  correo_contacto: 100,
  cargo_contacto: 50,
} as const;

/** Análisis de causa que la empresa registró a la PQRS. */
export interface PqrsAnalisis {
  codigo_solicitud_analisis_pk: number;
  fecha: string | null;
  razon: string | null;
  causa_raiz: string | null;
}

/** Seguimiento (plan de acción) que la empresa registró a la PQRS. */
export interface PqrsSeguimiento {
  codigo_solicitud_seguimiento_pk: number;
  fecha: string | null;
  plan_accion: string | null;
  descripcion: string | null;
}

/** Respuesta de la empresa a la PQRS. */
export interface PqrsRespuesta {
  codigo_solicitud_respuesta_pk: number;
  fecha: string | null;
  respuesta: string | null;
}

/** PQRS con su tema, el contacto que la registró y su gestión (`SolicitudPortalDetalleResponse`). */
export interface PqrsDetalle extends Pqrs {
  tema_nombre: string | null;
  nombre_contacto: string | null;
  numero_identificacion_contacto: string | null;
  telefono_contacto: string | null;
  correo_contacto: string | null;
  cargo_contacto: string | null;
  analisis: PqrsAnalisis[];
  seguimientos: PqrsSeguimiento[];
  respuestas: PqrsRespuesta[];
  /** Archivos que la empresa cargó y marcó para el portal; 0 si no tiene. */
  cantidad_archivos: number;
}
