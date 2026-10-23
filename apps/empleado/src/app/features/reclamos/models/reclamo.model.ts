export interface Reclamo {
  codigo_reclamo_pk: number;
  codigo_empleado_fk: number;
  codigo_reclamo_concepto_fk: string;
  reclamo_concepto_nombre: string;
  fecha: string;
  fecha_cierre: string;
  descripcion: string;
  estado_autorizado: boolean;
  estado_aprobado: boolean;
  estado_anulado: boolean;
  estado_cerrado: boolean;
  estado_atendido: boolean;
  cantidad_respuestas: number;
}

export interface CreateReclamoRequest {
  codigo_empleado_fk: number;
  codigo_reclamo_concepto_fk: string;
  descripcion: string;
}

export interface ReclamoRespuesta {
  codigo_reclamo_respuesta_pk: number;
  codigo_reclamo_fk: number;
  fecha: string;
  respuesta: string;
}

export interface ReclamoConcepto {
  codigo_reclamo_concepto_pk: string;
  nombre: string;
}
