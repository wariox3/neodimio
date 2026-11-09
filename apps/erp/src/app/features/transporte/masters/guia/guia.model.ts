import type { Guia } from '@semantica/core';
import { GuiaEstadoFiltro } from './guia.constants';

/**
 * Guía tal como llega en `GET /tte/guia/lista` (`GuiaResponse` de fluor).
 * Las relaciones solo traen el código; los nombres vienen en el detalle.
 */
export type { Guia };

/** Guía del listado con los nombres de sus ciudades ya resueltos. */
export interface GuiaFila extends Guia {
  readonly origen_nombre: string | null;
  readonly destino_nombre: string | null;
}

/** Guía completa de `GET /tte/guia/detalle/{id}` (`GuiaDetalleResponse` de fluor). */
export interface GuiaDetalle extends Guia {
  readonly guia_tipo_nombre: string | null;
  readonly codigo_operacion_ingreso_fk: string | null;
  readonly operacion_ingreso_nombre: string | null;
  readonly codigo_operacion_cargo_fk: string | null;
  readonly operacion_cargo_nombre: string | null;
  readonly tercero_nombre: string | null;
  readonly adquiriente_nombre: string | null;
  readonly codigo_asesor_fk: number | null;
  readonly asesor_nombre: string | null;
  readonly ciudad_origen_nombre: string | null;
  readonly ciudad_destino_nombre: string | null;
  readonly codigo_servicio_fk: string | null;
  readonly servicio_nombre: string | null;
  readonly codigo_producto_fk: string | null;
  readonly producto_nombre: string | null;
  readonly codigo_empaque_fk: string | null;
  readonly empaque_nombre: string | null;
  readonly codigo_tercero_operacion_fk: number | null;
  readonly codigo_zona_fk: string | null;
  readonly orden_ruta: number | null;
  readonly codigo_despacho_fk: number | null;
  readonly codigo_condicion_fk: number | null;
  readonly condicion_nombre: string | null;
  readonly codigo_factura_fk: number | null;
  readonly numero_factura: number | null;

  readonly documento_cliente_tipo: string | null;
  readonly relacion_cliente: string | null;
  readonly direccion_remitente: string | null;
  readonly telefono_remitente: string | null;
  readonly codigo_destinatario_fk: number | null;
  readonly codigo_identificacion_destinatario_fk: string | null;
  readonly numero_identificacion_destinatario: string | null;

  readonly fecha_ingreso_operacion: string | null;
  readonly fecha_soporte: string | null;
  readonly fecha_factura: string | null;

  readonly vr_recaudo: number;
  readonly vr_abono: number;
  readonly vr_cobro_entrega: number;
  readonly vr_otros: number;
  readonly tipo_liquidacion: string | null;
  readonly cantidad_despachos: number;

  readonly estado_impreso: boolean;
  readonly estado_embarcado: boolean;
  readonly estado_soporte: boolean;
  readonly estado_facturado: boolean;
  readonly estado_factura_generada: boolean;
  readonly estado_anulado: boolean;
  readonly estado_devolucion: boolean;

  readonly factura: boolean;
  readonly cortesia: boolean;
  readonly correccion: boolean;
  readonly reexpedicion: boolean;
  readonly devolver_documento_cliente: boolean;
  readonly mercancia_peligrosa: boolean | null;
  readonly contenido_verificado: boolean | null;
  readonly empaque_referencia: string | null;
  readonly usuario: string | null;
  readonly comentario: string | null;
}

/** Ciudad del catálogo de transporte (`GET /tte/ciudad/descargar`). */
export interface GuiaCiudad {
  readonly codigo_ciudad_pk: string;
  readonly nombre: string | null;
}

/** Filtros del listado de guías. */
export interface GuiaFiltros {
  readonly fecha_desde: Date | null;
  readonly fecha_hasta: Date | null;
  readonly estado: GuiaEstadoFiltro | null;
  readonly codigo_guia_pk: number | null;
  readonly documento_cliente: string | null;
}
