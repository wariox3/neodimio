export interface Pago {
  codigo_pago_pk: number;
  codigo_empleado_fk: number;
  fecha_desde: string;
  fecha_hasta: string;
  vr_salario_contrato: number;
  vr_devengado: number;
  vr_deduccion: number;
  vr_neto: number;
  codigo_pago_tipo_fk: string;
  pago_tipo_nombre: string;
  numero: number;
}
