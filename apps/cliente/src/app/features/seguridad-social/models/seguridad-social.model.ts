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

/** Soporte de la planilla de un empleado (`AporteContratoArchivoResponse` de fluor). */
export interface ArchivoSeguridadSocial {
  codigo_archivo_pk: number;
  /** Nombre con extensión, tal como se cargó en el ZIP de la planilla. */
  nombre: string | null;
  descripcion: string | null;
  fecha: string | null;
  extension_original: string | null;
  tipo: string | null;
  /** Tamaño en bytes. */
  tamano: number | null;
}

/** Tamaño legible de un archivo: `850 KB`, `1,2 MB`. */
export function tamanoLegible(bytes: number | null): string {
  if (!bytes) return '';
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toLocaleString('es-CO', { maximumFractionDigits: 1 })} MB`;
}
