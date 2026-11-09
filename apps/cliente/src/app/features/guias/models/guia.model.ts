import {
  Ciudad,
  GuiaTipo,
  OpcionCatalogo,
  PermisosGuia,
  Tercero,
} from '../../catalogos/models/catalogo.model';
import { Destinatario } from '../../destinatarios/models/destinatario.model';

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

/** Adquiriente por defecto: el tercero de la membresía del usuario. */
export function adquirienteDelCliente(tercero: Tercero): Adquiriente {
  return {
    codigo_tercero_pk: tercero.codigo_tercero_pk,
    codigo_identificacion_fk: tercero.codigo_identificacion_fk ?? '',
    numero_identificacion: tercero.numero_identificacion ?? '',
    nombre_corto: tercero.nombre_corto ?? '',
  };
}

/** Tipo de guía a crédito (`corriente` en terbio); en fluor es el pago `COR`. */
export function esTipoCredito(tipo: GuiaTipo | undefined): boolean {
  return tipo?.codigo_pago_fk === 'COR';
}

/**
 * Si el usuario puede elegir otro adquiriente con el tipo de guía actual, como la lupa de
 * terbio: requiere `permite_cambiar_adquiriente` y, con `bloquear_adquiriente_credito`,
 * no aplica a los tipos a crédito, donde el adquiriente es siempre el cliente.
 */
export function puedeCambiarAdquiriente(
  permisos: Pick<PermisosGuia, 'permite_cambiar_adquiriente' | 'bloquear_adquiriente_credito'>,
  tipo: GuiaTipo | undefined,
): boolean {
  if (!permisos.permite_cambiar_adquiriente) return false;
  return !(permisos.bloquear_adquiriente_credito && esTipoCredito(tipo));
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

/** Cuerpo de `POST /tte/guia/condicion-especial`. */
export interface CondicionEspecialRequest {
  codigo_tercero: number;
  origen: string;
  destino: string;
  precio: number;
  guia_tipo: string | null;
  producto: string | null;
}

/**
 * Precio y condiciones (flete y manejo) que aplican al tercero para un origen/destino.
 * Si no hay condición especial, los mínimos de manejo son los de la condición del tercero.
 */
export interface CondicionEspecialResponse {
  error: boolean;
  error_mensaje: string | null;
  condicion_especial_flete: boolean;
  condicion_especial_manejo: boolean;
  cobertura: string | null;
  vr_peso: number;
  vr_unidad: number;
  descuento_peso: number;
  descuento_unidad: number;
  peso_minimo: number;
  peso_minimo_guia: number;
  flete_minimo: number;
  flete_minimo_guia: number;
  porcentaje_manejo: number;
  manejo_minimo_unidad: number;
  manejo_minimo_guia: number;
  reexpedicion: boolean;
}

/** Campos del formulario de la guía nueva que determinan las condiciones. */
export interface ValoresCondicion {
  codigo_guia_tipo_fk?: string | null;
  codigo_ciudad_destino_fk?: string | null;
  codigo_producto_fk?: string | null;
}

/**
 * Datos para consultar las condiciones, o `null` si falta alguno. Como en terbio,
 * se consultan en cuanto hay destino, sin esperar el resto de la mercancía. Con
 * `invertir` (`invertir_origen_destino` del usuario) se consultan con el trayecto al revés;
 * la guía igual se guarda con su origen y destino reales.
 */
export function parametrosCondicion(
  valores: ValoresCondicion,
  tercero: Tercero | null,
  origen: string | null,
  invertir = false,
): CondicionEspecialRequest | null {
  const destino = valores.codigo_ciudad_destino_fk;
  const precio = tercero?.condicion_codigo_precio_fk ?? null;
  if (!tercero || precio === null || !origen || !destino) return null;

  return {
    codigo_tercero: tercero.codigo_tercero_pk,
    origen: invertir ? destino : origen,
    destino: invertir ? origen : destino,
    precio,
    guia_tipo: valores.codigo_guia_tipo_fk || null,
    producto: valores.codigo_producto_fk || null,
  };
}

/** Empaque y servicio que asigna holmio a las guías del portal (`apiOxigenoNuevo`). */
export const EMPAQUE_PORTAL = 'VARIOS';
export const SERVICIO_PORTAL = 'PAQ';

/** Cuerpo de `POST /tte/guia/nuevo` (`GuiaCreateRequest` de fluor). */
export interface GuiaNuevaRequest {
  codigo_guia_tipo_fk: string;
  codigo_operacion_ingreso_fk: string;
  codigo_tercero_fk: number;
  codigo_adquiriente_fk: number;
  codigo_empaque_fk: string;
  codigo_producto_fk: string;
  codigo_servicio_fk: string;
  codigo_ciudad_origen_fk: string;
  codigo_ciudad_destino_fk: string;
  documento_cliente: string | null;
  codigo_tercero_operacion_fk: number | null;
  remitente: string;
  codigo_destinatario_fk: number | null;
  codigo_identificacion_destinatario_fk: string;
  numero_identificacion_destinatario: string;
  nombre_destinatario: string;
  direccion_destinatario: string;
  telefono_destinatario: string;
  unidades: number;
  peso_real: number;
  peso_volumen: number;
  peso_facturado: number;
  vr_flete: number;
  vr_manejo: number;
  vr_declara: number;
  vr_recaudo: number;
  estado_recogido: boolean;
  estado_ingreso: boolean;
  devolver_documento_cliente: boolean;
  liquidar: boolean;
  condicion: number | null;
  precio: number | null;
  zona: string | null;
  tipo_liquidacion: TipoLiquidacion;
  comentario: string;
}

/** Lo que interesa de la respuesta de `POST /tte/guia/nuevo`. */
export interface GuiaNuevaResponse {
  codigo_guia_pk: number;
}

/** Valores del formulario de la guía nueva que van al guardar. */
export interface ValoresGuiaNueva {
  codigo_guia_tipo_fk: string;
  tipo_liquidacion: TipoLiquidacion | null;
  codigo_tercero_operacion_fk: number | null;
  documento_cliente: string;
  remitente: string;
  codigo_identificacion_destinatario_fk: TipoIdentificacion | null;
  numero_identificacion_destinatario: string;
  nombre_destinatario: string;
  direccion_destinatario: string;
  telefono_destinatario: string;
  codigo_ciudad_destino_fk: string | null;
  codigo_producto_fk: string;
  unidades: number;
  peso_real: number;
  peso_volumen: number;
  peso_facturado: number;
  vr_declara: number;
  vr_recaudo: number;
  devolver_documento_cliente: boolean;
  comentario: string;
}

/** Datos de la guía que no salen del formulario. */
export interface ContextoGuiaNueva {
  tercero: Tercero;
  /** Tercero al que se factura; por defecto el mismo cliente. */
  adquiriente: number;
  /** Operación de ingreso de la configuración del usuario. */
  operacionIngreso: string;
  origen: string;
  ciudades: Ciudad[];
  flete: number;
  manejo: number;
  /** Destinatario elegido en el buscador, si sigue siendo el de la guía. */
  destinatario: Destinatario | null;
  /** Estados con los que nace la guía, según la configuración del usuario. */
  estadoRecogido: boolean;
  estadoIngreso: boolean;
}

/**
 * Cuerpo para guardar la guía, como la arma terbio: los valores son los que ve el usuario
 * (`liquidar: false`) y los estados iniciales salen de la configuración del usuario.
 */
export function cuerpoGuiaNueva(v: ValoresGuiaNueva, ctx: ContextoGuiaNueva): GuiaNuevaRequest {
  const destino = v.codigo_ciudad_destino_fk ?? '';
  const destinatario =
    ctx.destinatario?.numero_identificacion === v.numero_identificacion_destinatario
      ? ctx.destinatario.codigo_destinatario_pk
      : null;
  return {
    codigo_guia_tipo_fk: v.codigo_guia_tipo_fk,
    codigo_operacion_ingreso_fk: ctx.operacionIngreso,
    codigo_tercero_fk: ctx.tercero.codigo_tercero_pk,
    codigo_adquiriente_fk: ctx.adquiriente,
    codigo_empaque_fk: EMPAQUE_PORTAL,
    codigo_producto_fk: v.codigo_producto_fk,
    codigo_servicio_fk: SERVICIO_PORTAL,
    codigo_ciudad_origen_fk: ctx.origen,
    codigo_ciudad_destino_fk: destino,
    documento_cliente: v.documento_cliente || null,
    codigo_tercero_operacion_fk: v.codigo_tercero_operacion_fk,
    // Como holmio: sin remitente queda el nombre del cliente.
    remitente: v.remitente || (ctx.tercero.nombre_corto ?? ''),
    codigo_destinatario_fk: destinatario,
    codigo_identificacion_destinatario_fk: v.codigo_identificacion_destinatario_fk ?? '',
    numero_identificacion_destinatario: v.numero_identificacion_destinatario,
    nombre_destinatario: v.nombre_destinatario,
    // Como holmio (`limpiarEspaciosTexto`): sin espacios repetidos.
    direccion_destinatario: v.direccion_destinatario.replace(/\s+/g, ' ').trim(),
    telefono_destinatario: v.telefono_destinatario,
    unidades: v.unidades,
    peso_real: v.peso_real,
    peso_volumen: v.peso_volumen,
    peso_facturado: v.peso_facturado,
    vr_flete: ctx.flete,
    vr_manejo: ctx.manejo,
    vr_declara: v.vr_declara,
    vr_recaudo: v.vr_recaudo,
    estado_recogido: ctx.estadoRecogido,
    estado_ingreso: ctx.estadoIngreso,
    devolver_documento_cliente: v.devolver_documento_cliente,
    liquidar: false,
    condicion: ctx.tercero.codigo_condicion_fk,
    precio: ctx.tercero.condicion_codigo_precio_fk,
    zona: ctx.ciudades.find((c) => c.codigo_ciudad_pk === destino)?.codigo_zona_fk ?? null,
    tipo_liquidacion: v.tipo_liquidacion ?? 'K',
    comentario: v.comentario,
  };
}

/**
 * Mínimos de peso de las condiciones del destino. `peso_minimo_guia` solo viene con
 * condición especial de flete; si no la hay, fluor lo devuelve en 0, igual que terbio.
 */
export type MinimosPeso = Pick<CondicionEspecialResponse, 'peso_minimo' | 'peso_minimo_guia'>;

/*
 * Reglas de los pesos al salir de cada campo, tal cual `guia/nuevo.html.twig` de terbio.
 * Cada una solo actualiza los campos que terbio actualiza en ese mismo evento.
 */

/** Al salir de unidades: el peso real pasa a ser unidades × peso mínimo, sin bajar del de la guía. */
export function pesoRealPorUnidades(unidades: number, minimos: MinimosPeso): number {
  const peso = unidades * minimos.peso_minimo;
  return peso < minimos.peso_minimo_guia ? minimos.peso_minimo_guia : peso;
}

/** Al salir del peso real: el volumen en 0 toma el peso real y se recalcula el facturado. */
export function pesosAlSalirDelReal(
  real: number,
  volumen: number,
  minimos: MinimosPeso,
): { peso_volumen: number; peso_facturado: number } {
  let facturado = volumen > real ? volumen : real;
  if (minimos.peso_minimo_guia > real && minimos.peso_minimo_guia > volumen) {
    facturado = minimos.peso_minimo_guia;
  }
  return { peso_volumen: volumen <= 0 ? real : volumen, peso_facturado: facturado };
}

/** Al salir del volumen: el facturado solo cambia si el volumen o el mínimo de la guía lo superan. */
export function facturadoAlSalirDelVolumen(
  volumen: number,
  real: number,
  facturado: number,
  minimos: MinimosPeso,
): number {
  if (volumen > real) facturado = volumen;
  if (minimos.peso_minimo_guia > real && minimos.peso_minimo_guia > volumen) {
    facturado = minimos.peso_minimo_guia;
  }
  return facturado;
}

/** Al salir del facturado: el digitado se respeta, pero no queda por debajo de los mínimos. */
export function facturadoAlSalirDelFacturado(
  facturado: number,
  unidades: number,
  volumen: number,
  minimos: MinimosPeso,
): number {
  const minimoTotal = unidades * minimos.peso_minimo;
  if (facturado < minimoTotal) facturado = minimoTotal;
  if (facturado < volumen && volumen > minimoTotal) facturado = volumen;
  if (facturado < minimos.peso_minimo_guia && minimos.peso_minimo_guia > minimoTotal) {
    facturado = minimos.peso_minimo_guia;
  }
  return facturado;
}

/** Campos del formulario de la guía nueva que intervienen en la liquidación. */
export interface ValoresLiquidacion {
  tipo_liquidacion?: TipoLiquidacion | null;
  unidades?: number | null;
  peso_volumen?: number | null;
  peso_facturado?: number | null;
  vr_declara?: number | null;
}

export interface Liquidacion {
  flete: number;
  manejo: number;
  peso_facturado: number;
}

/**
 * Liquida la guía con las condiciones del destino, con las fórmulas de `guia/nuevo.html.twig`
 * de terbio. Devuelve `null` si todavía no hay forma de liquidar o unidades. Como en terbio,
 * no se aplica `flete_minimo` (por unidad), solo `flete_minimo_guia`.
 */
export function liquidarGuia(
  valores: ValoresLiquidacion,
  condicion: CondicionEspecialResponse,
): Liquidacion | null {
  const unidades = valores.unidades ?? 0;
  if (!valores.tipo_liquidacion || unidades <= 0) return null;

  const pesoFacturado = facturadoAlSalirDelFacturado(
    valores.peso_facturado ?? 0,
    unidades,
    valores.peso_volumen ?? 0,
    condicion,
  );

  let flete: number;
  if (valores.tipo_liquidacion === 'K') {
    flete = pesoFacturado * condicion.vr_peso;
    if (condicion.descuento_peso > 0) flete -= (flete * condicion.descuento_peso) / 100;
  } else {
    flete = unidades * condicion.vr_unidad;
    if (condicion.descuento_unidad > 0) flete -= (flete * condicion.descuento_unidad) / 100;
  }
  if (condicion.flete_minimo_guia > flete) flete = condicion.flete_minimo_guia;

  let manejo = ((valores.vr_declara ?? 0) * condicion.porcentaje_manejo) / 100;
  if (manejo < unidades * condicion.manejo_minimo_unidad) {
    manejo = unidades * condicion.manejo_minimo_unidad;
  }
  if (manejo < condicion.manejo_minimo_guia) manejo = condicion.manejo_minimo_guia;

  return {
    flete: Math.round(flete),
    manejo: Math.round(manejo),
    peso_facturado: pesoFacturado,
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
