/**
 * Empleado del cliente con las fechas que exige la autorización para portar armas
 * (`AutorizacionArmaPortalResponse` de fluor).
 */
export interface AutorizacionArma {
  codigo_empleado_pk: number;
  numero_identificacion: string | null;
  nombre_corto: string | null;
  cargo_nombre: string | null;
  fecha_acreditacion: string | null;
  fecha_poligono: string | null;
  fecha_psicofisico: string | null;
  /** Acreditación, polígono y psicofísico vigentes hoy: entra en "Imprimir vigentes". */
  vigente: boolean;
}

/** Situación de una de las fechas del empleado. */
export type EstadoFecha = 'vigente' | 'vencida' | 'sin-fecha';

/**
 * Una fecha está vigente hasta el mismo día, como en holmio (`fecha >= hoy`). `hoy` va en
 * formato `YYYY-MM-DD`, igual que la fecha, para comparar sin zonas horarias.
 */
export function estadoFecha(fecha: string | null, hoy: string): EstadoFecha {
  if (!fecha) return 'sin-fecha';
  return fecha >= hoy ? 'vigente' : 'vencida';
}
