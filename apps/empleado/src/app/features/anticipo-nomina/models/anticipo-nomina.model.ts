export interface AnticipoNomina {
  codigo_anticipo_pk: number;
  codigo_empleado_fk: number;
  fecha_solicitud: string;
  vr_solicitado: number;
  vr_aprobado: number;
  estado: string;
  observacion: string;
}
