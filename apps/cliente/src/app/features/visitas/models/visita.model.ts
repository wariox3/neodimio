/** Visita que la empresa le hizo al cliente (`VisitaPortalResponse` de fluor, módulo CRM). */
export interface Visita {
  codigo_visita_pk: number;
  /** Fecha y hora de la visita. */
  fecha: string | null;
  codigo_visita_tipo_fk: string | null;
  visita_tipo_nombre: string | null;
  codigo_visita_motivo_fk: string | null;
  visita_motivo_nombre: string | null;
  codigo_asesor_fk: number | null;
  asesor_nombre: string | null;
}

/** Compromiso acordado en la visita (`VisitaCompromisoResponse` de fluor). */
export interface VisitaCompromiso {
  codigo_visita_compromiso_pk: number;
  fecha: string | null;
  nombre: string | null;
  detalle: string | null;
  /** `true` si el compromiso es del cliente; `false` si es de la empresa. */
  cliente: boolean;
  estado_atendido: boolean;
}

/** Reporte de la persona del cliente que atendió la visita (`VisitaReporteResponse` de fluor). */
export interface VisitaReporte {
  codigo_visita_reporte_pk: number;
  /** Fecha y hora del reporte. */
  fecha: string | null;
  nombre_contacto: string | null;
  cargo: string | null;
  reporte: string | null;
}

/** Visita con sus compromisos y reportes (`VisitaPortalDetalleResponse` de fluor). */
export interface VisitaDetalle extends Visita {
  compromisos: VisitaCompromiso[];
  reportes: VisitaReporte[];
  /** Archivos que la empresa cargó a la visita; 0 si no tiene. */
  cantidad_archivos: number;
}

/** Archivo que la empresa cargó a la visita (`ArchivoResponse` de fluor, `doc_archivo`). */
export interface ArchivoVisita {
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

/** Situación de un compromiso para el cliente. */
export type EstadoCompromiso = 'atendido' | 'pendiente' | 'vencido';

/**
 * Un compromiso pendiente vence cuando su fecha ya pasó. `hoy` va en formato
 * `YYYY-MM-DD`, igual que la fecha del compromiso, para comparar sin zonas horarias.
 */
export function estadoCompromiso(
  compromiso: Pick<VisitaCompromiso, 'estado_atendido' | 'fecha'>,
  hoy: string,
): EstadoCompromiso {
  if (compromiso.estado_atendido) return 'atendido';
  return compromiso.fecha && compromiso.fecha < hoy ? 'vencido' : 'pendiente';
}

/** Iniciales de un nombre para el avatar, por ejemplo `JP` para "Juan Pérez". */
export function iniciales(nombre: string | null): string {
  const partes = (nombre ?? '').trim().split(/\s+/).filter(Boolean);
  if (partes.length === 0) return '?';
  return partes
    .slice(0, 2)
    .map((p) => p[0].toUpperCase())
    .join('');
}
