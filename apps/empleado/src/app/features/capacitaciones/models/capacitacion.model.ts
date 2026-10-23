export interface Capacitacion {
  codigo_capacitacion_pk: number;
  codigo_empleado_fk: number;
  nombre: string;
  tipo: string;
  instructor: string;
  fecha_desde: string;
  fecha_hasta: string;
  horas: number;
  estado: string;
}

export interface CapacitacionEnlace {
  codigo_enlace_pk: number;
  codigo_modelo_fk: string;
  codigo_documento: number;
  nombre: string;
  url: string;
  descripcion: string | null;
  fecha: string;
  usuario: string;
}

export interface CapacitacionFichero {
  codigo_fichero_pk: number;
  codigo_fichero_tipo_fk: string;
  codigo_modelo_fk: string;
  codigo: string;
  nombre: string;
  extension: string;
  tipo: string;
  tamano: number;
  fecha: string;
  usuario: string;
}

export interface CapacitacionDetalle {
  codigo_capacitacion_detalle_pk: number;
  codigo_capacitacion_fk: number;
  evaluacion: string | null;
  asistencia: boolean;
  capacitacion_objetivo: string;
  capacitacion_fecha_capacitacion: string;
  capacitacion_lugar: string;
  capacitacion_contenido: string;
  enlaces: CapacitacionEnlace[];
  ficheros: CapacitacionFichero[];
}
