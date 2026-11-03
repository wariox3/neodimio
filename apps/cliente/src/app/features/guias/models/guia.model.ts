import { Ciudad, OpcionCatalogo, Tercero } from '../../catalogos/models/catalogo.model';

/**
 * Guía tal como llega en `GET /tte/guia/lista` (`GuiaResponse` de fluor).
 * Las ciudades solo traen el código; el nombre viene en el detalle.
 */
export interface Guia {
  codigo_guia_pk: number;
  codigo_guia_tipo_fk: string | null;
  codigo_tercero_fk: number | null;
  codigo_adquiriente_fk: number | null;
  codigo_ciudad_origen_fk: string | null;
  codigo_ciudad_destino_fk: string | null;
  codigo_ruta_fk: string | null;
  documento_cliente: string | null;
  remitente: string | null;
  nombre_destinatario: string | null;
  direccion_destinatario: string | null;
  telefono_destinatario: string | null;
  unidades: number | null;
  peso_real: number | null;
  peso_volumen: number | null;
  peso_facturado: number | null;
  vr_flete: number | null;
  vr_manejo: number | null;
  vr_declara: number | null;
  estado_recogido: boolean;
  fecha_recogido: string | null;
  estado_ingreso: boolean;
  fecha_ingreso: string | null;
  estado_despachado: boolean;
  fecha_despacho: string | null;
  estado_entregado: boolean;
  fecha_entrega: string | null;
  estado_cumplido: boolean;
  fecha_cumplido: string | null;
  estado_novedad: boolean;
  estado_novedad_solucion: boolean;
}

/** Guía completa de `GET /tte/guia/detalle/{id}` (`GuiaDetalleResponse` de fluor). */
export interface GuiaDetalle extends Guia {
  guia_tipo_nombre: string | null;
  tercero_nombre: string | null;
  adquiriente_nombre: string | null;
  ciudad_origen_nombre: string | null;
  ciudad_destino_nombre: string | null;
  codigo_servicio_fk: string | null;
  servicio_nombre: string | null;
  codigo_producto_fk: string | null;
  producto_nombre: string | null;
  empaque_nombre: string | null;
  codigo_despacho_fk: number | null;
  numero_factura: number | null;
  codigo_identificacion_destinatario_fk: string | null;
  numero_identificacion_destinatario: string | null;
  fecha_ingreso_operacion: string | null;
  fecha_soporte: string | null;
  fecha_factura: string | null;
  vr_recaudo: number;
  vr_otros: number;
  tipo_liquidacion: string | null;
  cantidad_despachos: number;
  estado_soporte: boolean;
  estado_facturado: boolean;
  estado_anulado: boolean;
  estado_devolucion: boolean;
  devolver_documento_cliente: boolean;
  usuario: string | null;
  comentario: string | null;
}

/** Novedad de una guía (`GET /tte/novedad/lista?codigo_guia_fk=`). */
export interface GuiaNovedad {
  codigo_novedad_pk: number;
  codigo_novedad_tipo_fk: string | null;
  descripcion: string | null;
  solucion: string | null;
  fecha: string | null;
  fecha_solucion: string | null;
  estado_solucion: boolean | null;
}

/** Filtro de estado que admite fluor en la lista (una bandera a la vez). */
export type GuiaEstadoFiltro =
  | 'estado_ingreso'
  | 'estado_despachado'
  | 'estado_entregado'
  | 'estado_novedad';

/** Parámetros de `GET /tte/guia/lista`. */
export interface GuiaListaParams {
  page: number;
  size: number;
  fecha_desde?: Date | null;
  fecha_hasta?: Date | null;
  estado?: GuiaEstadoFiltro | null;
  codigo_guia_pk?: number | null;
  documento_cliente?: string | null;
  codigo_guia_tipo_fk?: string | null;
  codigo_servicio_fk?: string | null;
  codigo_ciudad_origen_fk?: string | null;
  codigo_ciudad_destino_fk?: string | null;
  codigo_despacho_fk?: number | null;
  codigo_tercero_operacion_fk?: number | null;
}

/** Cliente que paga la guía; en terbio sale de `codigoTerceroErpFk` del usuario. */
export interface Adquiriente {
  codigo_tercero_pk: number;
  codigo_identificacion_fk: string;
  numero_identificacion: string;
  nombre_corto: string;
}

export type TipoIdentificacion = 'CC' | 'NI';

/**
 * Tipo de identificación de un destinatario para la guía. La guía solo admite CC y NI;
 * con cualquier otro devuelve `null` para que el usuario lo elija en vez de asumirlo.
 */
export function tipoIdentificacionGuia(codigo: string | null): TipoIdentificacion | null {
  return codigo === 'CC' || codigo === 'NI' ? codigo : null;
}

/** Tipo de liquidación de la guía en fluor: por kilo o por unidad. */
export type TipoLiquidacion = 'K' | 'U';

/** Cuerpo de `POST /tte/guia/liquidar`. */
export interface LiquidarRequest {
  tercero: number;
  condicion: number | null;
  precio: number;
  origen: string;
  destino: string;
  producto: string;
  zona: string | null;
  tipo_liquidacion: TipoLiquidacion;
  unidades: number;
  peso: number;
  volumen: number;
  declarado: number;
}

export interface LiquidarResponse {
  error: boolean;
  flete: number;
  manejo: number;
  peso_facturado: number;
}

/** Campos del formulario de la guía nueva que intervienen en la liquidación. */
export interface ValoresLiquidacion {
  codigo_ciudad_destino_fk?: string | null;
  codigo_producto_fk?: string | null;
  tipo_liquidacion?: TipoLiquidacion | null;
  unidades?: number | null;
  peso_real?: number | null;
  peso_volumen?: number | null;
  vr_declara?: number | null;
}

/** Datos para liquidar, o `null` si todavía falta alguno de los indispensables. */
export function parametrosLiquidacion(
  valores: ValoresLiquidacion,
  tercero: Tercero | null,
  origen: string | null,
  ciudades: Ciudad[],
): LiquidarRequest | null {
  const destino = valores.codigo_ciudad_destino_fk;
  const producto = valores.codigo_producto_fk;
  const tipoLiquidacion = valores.tipo_liquidacion;
  const unidades = valores.unidades ?? 0;
  const precio = tercero?.condicion_codigo_precio_fk ?? null;
  if (!tercero || precio === null || !origen || !destino || !producto) return null;
  if (!tipoLiquidacion || unidades <= 0) return null;

  return {
    tercero: tercero.codigo_tercero_pk,
    condicion: tercero.codigo_condicion_fk,
    precio,
    origen,
    destino,
    producto,
    zona: ciudades.find((c) => c.codigo_ciudad_pk === destino)?.codigo_zona_fk ?? null,
    tipo_liquidacion: tipoLiquidacion,
    unidades,
    peso: valores.peso_real ?? 0,
    volumen: valores.peso_volumen ?? 0,
    declarado: valores.vr_declara ?? 0,
  };
}

/**
 * Operación que queda seleccionada al crear una guía: la configurada para el usuario,
 * siempre que siga siendo una de las operaciones de su cliente.
 */
export function operacionPorDefecto(
  operaciones: OpcionCatalogo<number>[],
  configurada: number | null,
): number | null {
  return operaciones.some((o) => o.value === configurada) ? configurada : null;
}

/** Formas de liquidar habilitadas para el tercero, en el mismo orden de terbio. */
export function liquidacionesDisponibles(tercero: Tercero): OpcionCatalogo<TipoLiquidacion>[] {
  const opciones: OpcionCatalogo<TipoLiquidacion>[] = [];
  if (tercero.liquidar_guia_peso) opciones.push({ value: 'K', label: 'Kilo' });
  if (tercero.liquidar_guia_unidad) opciones.push({ value: 'U', label: 'Unidad' });
  return opciones;
}
