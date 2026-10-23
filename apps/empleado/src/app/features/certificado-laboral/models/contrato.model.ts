export interface Contrato {
  codigo_contrato_pk: number;
  codigo_empleado_fk: number;
  fecha_desde: string;
  fecha_hasta: string;
  vr_salario: number;
  contrato_tipo_nombre: string;
  cargo_nombre: string;
  grupo_nombre: string;
}
