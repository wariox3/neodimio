import { GuiaEstadoFiltro } from './guia.constants';

/**
 * Guía tal como llega en `GET /tte/guia/lista` (`GuiaResponse` de fluor).
 * Las relaciones solo traen el código; los nombres vienen en el detalle.
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
  codigo_operacion_ingreso_fk: string | null;
  operacion_ingreso_nombre: string | null;
  codigo_operacion_cargo_fk: string | null;
  operacion_cargo_nombre: string | null;
  tercero_nombre: string | null;
  adquiriente_nombre: string | null;
  codigo_asesor_fk: number | null;
  asesor_nombre: string | null;
  ciudad_origen_nombre: string | null;
  ciudad_destino_nombre: string | null;
  codigo_servicio_fk: string | null;
  servicio_nombre: string | null;
  codigo_producto_fk: string | null;
  producto_nombre: string | null;
  codigo_empaque_fk: string | null;
  empaque_nombre: string | null;
  codigo_tercero_operacion_fk: number | null;
  codigo_zona_fk: string | null;
  orden_ruta: number | null;
  codigo_despacho_fk: number | null;
  codigo_condicion_fk: number | null;
  condicion_nombre: string | null;
  codigo_factura_fk: number | null;
  numero_factura: number | null;

  documento_cliente_tipo: string | null;
  relacion_cliente: string | null;
  direccion_remitente: string | null;
  telefono_remitente: string | null;
  codigo_destinatario_fk: number | null;
  codigo_identificacion_destinatario_fk: string | null;
  numero_identificacion_destinatario: string | null;

  fecha_ingreso_operacion: string | null;
  fecha_soporte: string | null;
  fecha_factura: string | null;

  vr_recaudo: number;
  vr_abono: number;
  vr_cobro_entrega: number;
  vr_otros: number;
  tipo_liquidacion: string | null;
  cantidad_despachos: number;

  estado_impreso: boolean;
  estado_embarcado: boolean;
  estado_soporte: boolean;
  estado_facturado: boolean;
  estado_factura_generada: boolean;
  estado_anulado: boolean;
  estado_devolucion: boolean;

  factura: boolean;
  cortesia: boolean;
  correccion: boolean;
  reexpedicion: boolean;
  devolver_documento_cliente: boolean;
  mercancia_peligrosa: boolean | null;
  contenido_verificado: boolean | null;
  empaque_referencia: string | null;
  usuario: string | null;
  comentario: string | null;
}

/** Ciudad del catálogo de transporte (`GET /tte/ciudad/descargar`). */
export interface GuiaCiudad {
  codigo_ciudad_pk: string;
  nombre: string | null;
}

/** Filtros del listado de guías. */
export interface GuiaFiltros {
  fecha_desde: Date | null;
  fecha_hasta: Date | null;
  estado: GuiaEstadoFiltro | null;
  codigo_guia_pk: number | null;
  documento_cliente: string | null;
}
