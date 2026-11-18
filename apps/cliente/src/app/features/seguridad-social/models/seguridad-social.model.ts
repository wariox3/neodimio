/**
 * Empleado del cliente en la planilla de seguridad social de un mes
 * (`AporteContratoPortalResponse` de fluor).
 */
export interface SeguridadSocial {
  codigo_aporte_contrato_pk: number;
  codigo_aporte_fk: number;
  codigo_contrato_fk: number;
  codigo_empleado_fk: number | null;
  empleado_nombre: string | null;
  numero_identificacion: string | null;
  /** Soportes cargados; 0 mientras no se haya subido la planilla del empleado. */
  cantidad_archivos: number;
}
