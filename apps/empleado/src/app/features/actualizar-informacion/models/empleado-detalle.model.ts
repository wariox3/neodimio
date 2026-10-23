export interface EmpleadoDetalle {
  codigo_empleado_pk: number;
  codigo_identificacion_fk: string;
  numero_identificacion: string;
  nombre_corto: string;
  nombre1: string;
  nombre2: string | null;
  apellido1: string;
  apellido2: string | null;
  telefono: string | null;
  celular: string | null;
  correo: string | null;
  correo_corporativo: string | null;
  direccion: string | null;
  barrio: string | null;
  codigo_ciudad_fk: number | null;
}

export interface Ciudad {
  codigo_ciudad_pk: number;
  nombre: string;
}

export interface ActualizarInformacionRequest {
  codigo_empleado_fk: number;
  codigo_ciudad_fk: number | null;
  celular: string;
  telefono: string;
  direccion: string;
  barrio: string;
}
