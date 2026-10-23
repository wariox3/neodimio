/** Códigos que el API devuelve en `estado_solicitud`. Cualquier otro valor se trata como pendiente. */
export type EstadoSolicitud = 'A' | 'R';

export interface SolicitudEmpleado {
  codigo_solicitud_empleado_pk: number;
  codigo_empleado_fk: number;
  codigo_solicitud_empleado_tipo_fk: string;
  solicitud_empleado_tipo_nombre: string;
  fecha_registro: string;
  fecha_desde: string;
  fecha_hasta: string;
  comentario: string;
  usuario: string;
  comentario_rechazo: string;
  estado_autorizado: boolean;
  estado_aprobado: boolean;
  estado_anulado: boolean;
  estado_cerrado: boolean;
  estado_solicitud: EstadoSolicitud;
  codigo_empresa_fk: number;
}

export interface CreateSolicitudRequest {
  codigo_empleado_fk: number;
  codigo_solicitud_empleado_tipo_fk: string;
  fecha_desde: string;
  fecha_hasta: string;
  comentario: string | null;
}

export interface SolicitudEmpleadoTipo {
  codigo_solicitud_empleado_tipo_pk: string;
  nombre: string;
  habilitado_portal: boolean;
}
