/** Guía de transporte tal como la entrega el listado de fluor. */
export interface Guia {
  readonly codigo_guia_pk: number;
  readonly codigo_guia_tipo_fk: string | null;
  readonly codigo_tercero_fk: number | null;
  readonly codigo_adquiriente_fk: number | null;
  readonly codigo_ciudad_origen_fk: string | null;
  readonly codigo_ciudad_destino_fk: string | null;
  readonly codigo_ruta_fk: string | null;
  readonly documento_cliente: string | null;
  readonly remitente: string | null;
  readonly nombre_destinatario: string | null;
  readonly direccion_destinatario: string | null;
  readonly telefono_destinatario: string | null;
  readonly unidades: number | null;
  readonly peso_real: number | null;
  readonly peso_volumen: number | null;
  readonly peso_facturado: number | null;
  readonly vr_flete: number | null;
  readonly vr_manejo: number | null;
  readonly vr_declara: number | null;
  readonly estado_recogido: boolean;
  readonly fecha_recogido: string | null;
  readonly estado_ingreso: boolean;
  readonly fecha_ingreso: string | null;
  readonly estado_despachado: boolean;
  readonly fecha_despacho: string | null;
  readonly estado_entregado: boolean;
  readonly fecha_entrega: string | null;
  readonly estado_cumplido: boolean;
  readonly fecha_cumplido: string | null;
  readonly estado_novedad: boolean;
  readonly estado_novedad_solucion: boolean;
}
