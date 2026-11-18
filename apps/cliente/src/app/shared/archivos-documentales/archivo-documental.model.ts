/**
 * Archivo que holmio carga a un registro en `doc_archivo` (`ArchivoResponse` de fluor).
 * Lo comparten las visitas, las PQRS y la seguridad social.
 */
export interface ArchivoDocumental {
  codigo_archivo_pk: number;
  /** Nombre original con extensión, tal como se cargó en holmio. */
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
