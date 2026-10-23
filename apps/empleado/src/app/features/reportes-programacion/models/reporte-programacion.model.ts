export interface ProgramacionReporteRespuesta {
  codigo_programacion_reporte_respuesta_pk: number;
  codigo_programacion_reporte_fk: number;
  fecha: string;
  respuesta: string;
  usuario: string;
}

export interface ProgramacionReporte {
  codigo_programacion_reporte_pk: number;
  codigo_programacion_fk: number;
  fecha: string;
  fecha_cierre: string;
  reporta: string;
  comentario: string;
  cantidad_respuestas: number;
  estado_autorizado: boolean;
  estado_aprobado: boolean;
  estado_anulado: boolean;
  estado_atendido: boolean;
  estado_cerrado: boolean;
  dia_desde: number;
  dia_hasta: number;
  codigo_programacion_reporte_tipo_fk: string;
  programacion_reporte_tipo_nombre: string;
}
