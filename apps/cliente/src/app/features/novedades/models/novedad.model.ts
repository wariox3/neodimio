/** Novedad de transporte (`NovedadResponse` de fluor). */
export interface Novedad {
  codigo_novedad_pk: number;
  codigo_novedad_tipo_fk: string | null;
  codigo_guia_fk: number | null;
  descripcion: string | null;
  solucion: string | null;
  fecha: string | null;
  fecha_solucion: string | null;
  estado_atendido: boolean | null;
  estado_solucion: boolean | null;
}

/** Parámetros de `GET /tte/novedad/lista`. */
export interface NovedadListaParams {
  page: number;
  size: number;
  codigo_guia_fk?: number | null;
  estado_atendido?: boolean | null;
  estado_solucion?: boolean | null;
  fecha_desde?: Date | null;
  fecha_hasta?: Date | null;
}
