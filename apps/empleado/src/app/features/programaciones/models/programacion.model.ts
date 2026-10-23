export interface ProgramacionEmpleado {
  codigo_programacion_pk: number;
  puesto_nombre: string;
  puesto_direccion: string;
  codigo_puesto_fk: string;
  coordinador_nombre: string;
  programador_nombre: string;
  codigo_modalidad_fk: string;
  tercero_nombre_corto: string;
  dia_1: string | null;
  dia_2: string | null;
  dia_3: string | null;
  dia_4: string | null;
  dia_5: string | null;
  dia_6: string | null;
  dia_7: string | null;
  dia_8: string | null;
  dia_9: string | null;
  dia_10: string | null;
  dia_11: string | null;
  dia_12: string | null;
  dia_13: string | null;
  dia_14: string | null;
  dia_15: string | null;
  dia_16: string | null;
  dia_17: string | null;
  dia_18: string | null;
  dia_19: string | null;
  dia_20: string | null;
  dia_21: string | null;
  dia_22: string | null;
  dia_23: string | null;
  dia_24: string | null;
  dia_25: string | null;
  dia_26: string | null;
  dia_27: string | null;
  dia_28: string | null;
  dia_29: string | null;
  dia_30: string | null;
  dia_31: string | null;
}

export interface Turno {
  codigo_turno_pk: string;
  nombre: string;
  hora_desde: string;
  hora_hasta: string;
  horas: number;
  horas_diurnas: number;
  horas_nocturnas: number;
  horas_recargo_nocturno: number;
  novedad: boolean;
  descanso: boolean;
  descanso_ordinario: boolean;
  incapacidad: boolean;
  incapacidad_no_legalizada: boolean;
  licencia: boolean;
  licencia_no_remunerada: boolean;
  vacacion: boolean;
  ingreso: boolean;
  retiro: boolean;
  induccion: boolean;
  ausentismo: boolean;
  dia: boolean;
  noche: boolean;
  complementario: boolean;
  adicional: boolean;
  completo: boolean;
  disponible: boolean;
  vr_adicional: number;
  adicional_dia: boolean;
  adicional_noche: boolean;
  codigo_empresa_fk: number;
  estado_inactivo: boolean;
}

export interface ProgramacionReporteTipo {
  codigo_programacion_reporte_tipo_pk: string;
  nombre: string;
}

export interface CreateProgramacionReporteRequest {
  codigo_programacion_fk: number;
  codigo_programacion_reporte_tipo_fk: string;
  comentario: string;
  dia_desde: number;
  dia_hasta: number;
  reporta: string;
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
