/** Cotización del cliente (`CotizacionPortalResponse` de fluor, módulo CRM). */
export interface Cotizacion {
  codigo_cotizacion_pk: number;
  numero: number | null;
  fecha: string | null;
  vencimiento: string | null;
  codigo_cotizacion_tipo_fk: string | null;
  cotizacion_tipo_nombre: string | null;
  codigo_tercero_fk: number | null;
  tercero_nombre_corto: string | null;
  codigo_asesor_fk: number | null;
  asesor_nombre: string | null;
  codigo_forma_pago_fk: string | null;
  forma_pago_nombre: string | null;
  codigo_negocio_fk: number | null;
  negocio_nombre: string | null;
  vr_subtotal: number;
  vr_iva: number;
  vr_neto: number;
  vr_total: number;
  estado_autorizado: boolean | null;
  estado_aprobado: boolean | null;
  estado_anulado: boolean | null;
}

/** Estado de la cotización para mostrar en una sola etiqueta. */
export interface EstadoCotizacion {
  label: string;
  severity: 'success' | 'info' | 'danger' | 'secondary';
}

/**
 * Resume los estados de holmio, que terbio mostraba en tres columnas (AUT, APR, ANU):
 * la anulación prevalece, luego la aprobación y luego la autorización.
 */
export function estadoCotizacion(
  cotizacion: Pick<Cotizacion, 'estado_autorizado' | 'estado_aprobado' | 'estado_anulado'>,
): EstadoCotizacion {
  if (cotizacion.estado_anulado) return { label: 'Anulada', severity: 'danger' };
  if (cotizacion.estado_aprobado) return { label: 'Aprobada', severity: 'success' };
  if (cotizacion.estado_autorizado) return { label: 'Autorizada', severity: 'info' };
  return { label: 'Pendiente', severity: 'secondary' };
}

/** Negocio con su código, como en terbio (`12 - Nombre`). */
export function negocioCotizacion(
  cotizacion: Pick<Cotizacion, 'codigo_negocio_fk' | 'negocio_nombre'>,
): string {
  if (cotizacion.codigo_negocio_fk === null) return cotizacion.negocio_nombre ?? '—';
  return cotizacion.negocio_nombre
    ? `${cotizacion.codigo_negocio_fk} - ${cotizacion.negocio_nombre}`
    : String(cotizacion.codigo_negocio_fk);
}

/** Encabezado de la cotización en su detalle (`CotizacionPortalDetalleResponse` de fluor). */
export interface CotizacionDetalle extends Cotizacion {
  codigo_sector_fk: string | null;
  estrato: number | null;
  tiempo_entrega: string | null;
  comentarios: string | null;
  vr_descuento: number;
  costo_envio: number | null;
}

/** Tipo de cotización que el cliente puede solicitar (`CotizacionTipoPortalResponse`). */
export interface CotizacionTipo {
  codigo_cotizacion_tipo_pk: string;
  nombre: string;
}

/** Días de la semana en que se presta un servicio, más los festivos. */
export type DiaServicio =
  | 'lunes'
  | 'martes'
  | 'miercoles'
  | 'jueves'
  | 'viernes'
  | 'sabado'
  | 'domingo'
  | 'festivo';

/** Servicio cotizado con las horas y valores que liquidó fluor (`CotizacionDetallePortalResponse`). */
export interface CotizacionServicio extends Record<DiaServicio, boolean> {
  codigo_cotizacion_detalle_pk: number;
  codigo_item_fk: number;
  item_nombre: string | null;
  codigo_modalidad_fk: string | null;
  modalidad_nombre: string | null;
  cantidad: number;
  fecha_desde: string | null;
  fecha_hasta: string | null;
  /** `HH:mm:ss`; 00:00 a 00:00 es un servicio de 24 horas. */
  hora_desde: string | null;
  hora_hasta: string | null;
  horario: string | null;
  horas: number;
  horas_diurnas: number;
  horas_nocturnas: number;
  vr_precio_minimo: number | null;
  vr_subtotal: number | null;
  vr_iva: number | null;
  vr_total_detalle: number;
}

/** Sectores que ofrecía terbio al cotizar. */
export type SectorCotizacion = 'COM' | 'RES';

/** Modalidades que ofrecía terbio al agregar un servicio. */
export type ModalidadServicio = 'SAR' | 'CAR' | 'CAN';

/** Cuerpo de `POST /crm/cotizacion/nuevo-portal`; el tercero lo pone fluor según la membresía. */
export interface CotizacionNuevaRequest {
  codigo_cotizacion_tipo_fk: string;
  codigo_sector_fk: SectorCotizacion;
  estrato: number | null;
  comentarios: string | null;
}

/** Cuerpo de `POST /crm/cotizacion/{id}/detalle-nuevo-portal`. */
export interface ServicioNuevoRequest extends Record<DiaServicio, boolean> {
  codigo_modalidad_fk: ModalidadServicio;
  cantidad: number;
  /** `YYYY-MM-DD`. */
  fecha_desde: string;
  fecha_hasta: string;
  /** `HH:mm`. */
  hora_desde: string;
  hora_hasta: string;
}

export const SECTORES: readonly { value: SectorCotizacion; label: string }[] = [
  { value: 'COM', label: 'Comercial' },
  { value: 'RES', label: 'Residencial' },
];

export const MODALIDADES: readonly { value: ModalidadServicio; label: string }[] = [
  { value: 'SAR', label: 'Sin arma' },
  { value: 'CAR', label: 'Con arma' },
  { value: 'CAN', label: 'Canino' },
];

/** Días del servicio en el orden de terbio, con la abreviatura de su columna (L, M, X…). */
export const DIAS_SERVICIO: readonly { campo: DiaServicio; label: string; corto: string }[] = [
  { campo: 'lunes', label: 'Lunes', corto: 'L' },
  { campo: 'martes', label: 'Martes', corto: 'M' },
  { campo: 'miercoles', label: 'Miércoles', corto: 'X' },
  { campo: 'jueves', label: 'Jueves', corto: 'J' },
  { campo: 'viernes', label: 'Viernes', corto: 'V' },
  { campo: 'sabado', label: 'Sábado', corto: 'S' },
  { campo: 'domingo', label: 'Domingo', corto: 'D' },
  { campo: 'festivo', label: 'Festivo', corto: 'F' },
];

/** Estrato con el que terbio proponía la cotización nueva. */
export const ESTRATO_POR_DEFECTO = 3;

/** Largo máximo de los comentarios que acepta fluor. */
export const COMENTARIOS_MAX_LENGTH = 500;

/**
 * Como holmio, una cotización autorizada o anulada ya no cambia sus servicios; fluor
 * también lo valida.
 */
export function cotizacionEditable(
  cotizacion: Pick<Cotizacion, 'estado_autorizado' | 'estado_anulado'>,
): boolean {
  return !cotizacion.estado_autorizado && !cotizacion.estado_anulado;
}

/** Hora `HH:mm` de un valor `HH:mm:ss` de fluor. */
export function horaCorta(hora: string | null): string {
  return hora ? hora.slice(0, 5) : '—';
}
