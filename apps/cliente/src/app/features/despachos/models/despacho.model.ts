/** Despacho (`DespachoResponse` de fluor). */
export interface Despacho {
  codigo_despacho_pk: number;
  numero: number | null;
  fecha: string | null;
  codigo_vehiculo_fk: string | null;
  codigo_ciudad_origen_fk: string | null;
  codigo_ciudad_destino_fk: string | null;
  estado_autorizado: boolean | null;
  estado_aprobado: boolean | null;
  estado_entregado: boolean;
}

/** Parámetros de `GET /tte/despacho/lista`. */
export interface DespachoListaParams {
  page: number;
  size: number;
  numero?: number | null;
  codigo_vehiculo_fk?: string | null;
  fecha_desde?: Date | null;
  fecha_hasta?: Date | null;
}

/** Despacho en el que ha viajado una guía (`GET /tte/despacho-detalle/guia/{id}`). */
export interface DespachoDeGuia {
  codigo_despacho_detalle_pk: number;
  numero: number | null;
  fecha_salida: string | null;
  ciudad_origen: string | null;
  ciudad_destino: string | null;
  conductor_nombre_corto: string | null;
  estado_entregado: boolean | null;
}
