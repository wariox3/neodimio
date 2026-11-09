/** Cuenta por cobrar con saldo (`CuentaCobrarItem` de fluor). */
export interface CuentaPendiente {
  codigo_cuenta_cobrar_pk: number;
  numero_documento: string | null;
  numero_referencia: string | null;
  fecha: string | null;
  fecha_vence: string | null;
  vr_subtotal: number;
  vr_saldo_original: number;
  vr_saldo: number;
  vr_saldo_operado: number;
  vr_abono: number;
  plazo: number | null;
  codigo_tercero_fk: number;
  codigo_clasificacion_fk: string | null;
  cuenta_cobrar_tipo_nombre: string | null;
  tercero_nombre_corto: string | null;
  tercero_numero_identificacion: string | null;
  clasificacion_nombre: string | null;
}

/** Parámetros de `GET /car/cuenta-cobrar/pendiente`. */
export interface PendienteListaParams {
  page: number;
  size: number;
  numero_documento?: string | null;
  /** `true` deja solo las vencidas; sin valor trae todas. */
  vencidas?: boolean | null;
  fecha_desde?: Date | null;
  fecha_hasta?: Date | null;
}

/** Movimiento de cartera (`MovimientoResponse` de fluor). */
export interface MovimientoCartera {
  codigo_movimiento_pk: number;
  codigo_movimiento_tipo_fk: string;
  codigo_movimiento_clase_fk: string;
  codigo_tercero_fk: number | null;
  numero: number;
  fecha: string;
  fecha_documento: string | null;
  soporte: string | null;
  comentarios: string | null;
  vr_total_bruto: number | null;
  vr_retencion: number | null;
  vr_total_neto: number | null;
  estado_aprobado: boolean | null;
  estado_anulado: boolean | null;
  movimiento_tipo_nombre: string | null;
}

/** Filtros de la lista de recibos. */
export interface ReciboFiltros {
  fecha_desde?: Date | null;
  fecha_hasta?: Date | null;
}

/**
 * Recibos que ve el cliente: los aprobados y no anulados, como `apiLista` de holmio.
 * Fluor aún no filtra por estado, así que se aplica sobre lo consultado.
 */
export function recibosVigentes(movimientos: MovimientoCartera[]): MovimientoCartera[] {
  return movimientos.filter((m) => !!m.estado_aprobado && !m.estado_anulado);
}
