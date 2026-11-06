/** Factura de venta (`FacturaResponse` de fluor, módulo de turnos). */
export interface Factura {
  codigo_factura_pk: number;
  codigo_factura_tipo_fk: string | null;
  codigo_tercero_fk: number | null;
  numero: number | null;
  prefijo: string | null;
  fecha: string | null;
  fecha_vence: string | null;
  soporte: string | null;
  vr_subtotal: number;
  vr_iva: number | null;
  vr_neto: number;
  vr_total: number;
  estado_aprobado: boolean;
  estado_anulado: boolean;
  factura_tipo_nombre: string | null;
}

/** Filtros de la lista de facturas. */
export interface FacturaFiltros {
  fecha_desde?: Date | null;
  fecha_hasta?: Date | null;
}

/**
 * Facturas que ve el cliente: las aprobadas, como `listaApi` de holmio.
 * Fluor aún no filtra por estado, así que se aplica sobre lo consultado.
 */
export function facturasVisibles(facturas: Factura[]): Factura[] {
  return facturas.filter((f) => f.estado_aprobado);
}

/** Número con su prefijo de facturación, por ejemplo `FE-1024`. */
export function numeroFactura(factura: Pick<Factura, 'prefijo' | 'numero'>): string {
  if (factura.numero === null) return '—';
  return factura.prefijo ? `${factura.prefijo}-${factura.numero}` : String(factura.numero);
}
