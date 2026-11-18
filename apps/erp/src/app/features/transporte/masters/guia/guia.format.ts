import { formatNumber } from '@angular/common';
import { APP_LOCALE } from '@semantica/core';
import { TIPOS_LIQUIDACION } from './guia.constants';
import { GuiaDetalle } from './guia.model';

/** Dato de la ficha; sin valor se muestra un guion. */
export interface CampoGuia {
  label: string;
  valor: string | number | null;
  /** Ocupa todo el ancho de la ficha. */
  completo?: boolean;
  destacado?: boolean;
  /** Identificador: se lee mejor en monoespaciada. */
  mono?: boolean;
}

/** Datos de la ficha, en el orden y la agrupación en que se presentan. */
export interface FichaGuia {
  informacion: SeccionGuia;
  /** Remitente, destinatario y ruta: se leen juntos, como grupos de una misma tarjeta. */
  partes: SeccionGuia[];
  mercancia: SeccionGuia;
}

export interface SeccionGuia {
  titulo: string;
  campos: CampoGuia[];
}

/** Paso de la línea de tiempo de la guía. */
export interface PasoSeguimiento {
  titulo: string;
  icono: string;
  fecha: string | null;
  completado: boolean;
  detalle?: string;
}

/** Sin dato no es lo mismo que cero: un flete nulo se muestra con guion, no como `$ 0`. */
const cantidad = (valor: number | null) =>
  valor == null ? null : formatNumber(valor, APP_LOCALE, '1.0-0');
const peso = (valor: number | null) => (valor == null ? null : `${cantidad(valor)} kg`);
const dinero = (valor: number | null) =>
  valor == null ? null : `$ ${formatNumber(valor, APP_LOCALE, '1.0-0')}`;

/** Une las partes presentes; si no hay ninguna devuelve `null`. */
function unir(...partes: (string | null)[]): string | null {
  return partes.filter(Boolean).join(' ') || null;
}

/** Datos de la ficha de una guía. */
export function fichaGuia(g: GuiaDetalle): FichaGuia {
  const origen = g.ciudad_origen_nombre ?? g.codigo_ciudad_origen_fk ?? '—';
  const destino = g.ciudad_destino_nombre ?? g.codigo_ciudad_destino_fk ?? '—';

  return {
    informacion: {
      titulo: 'Información de la guía',
      campos: [
        { label: 'Número de guía', valor: g.codigo_guia_pk, mono: true },
        { label: 'Trayecto', valor: `${origen} → ${destino}` },
        { label: 'Tipo', valor: g.guia_tipo_nombre ?? g.codigo_guia_tipo_fk },
        { label: 'Servicio', valor: g.servicio_nombre ?? g.codigo_servicio_fk },
        { label: 'Producto', valor: g.producto_nombre ?? g.codigo_producto_fk },
        { label: 'Empaque', valor: g.empaque_nombre ?? g.codigo_empaque_fk },
        { label: 'Referencia de empaque', valor: g.empaque_referencia },
        { label: 'Cliente', valor: g.tercero_nombre ?? g.codigo_tercero_fk },
        { label: 'Adquiriente', valor: g.adquiriente_nombre ?? g.codigo_adquiriente_fk },
        { label: 'Asesor', valor: g.asesor_nombre ?? g.codigo_asesor_fk },
        { label: 'Condición', valor: g.condicion_nombre ?? g.codigo_condicion_fk },
        {
          label: 'Documento cliente',
          valor: unir(g.documento_cliente_tipo, g.documento_cliente),
          mono: true,
        },
        { label: 'Relación cliente', valor: g.relacion_cliente },
        {
          label: 'Tipo de liquidación',
          valor: g.tipo_liquidacion
            ? (TIPOS_LIQUIDACION[g.tipo_liquidacion] ?? g.tipo_liquidacion)
            : null,
        },
        { label: 'Usuario', valor: g.usuario },
        ...(g.comentario ? [{ label: 'Comentario', valor: g.comentario, completo: true }] : []),
      ],
    },
    partes: [
      {
        titulo: 'Remitente',
        campos: [
          { label: 'Nombre', valor: g.remitente },
          { label: 'Teléfono', valor: g.telefono_remitente },
          { label: 'Dirección', valor: g.direccion_remitente, completo: true },
        ],
      },
      {
        titulo: 'Destinatario',
        campos: [
          { label: 'Nombre', valor: g.nombre_destinatario },
          {
            label: 'Identificación',
            valor: g.numero_identificacion_destinatario
              ? unir(g.codigo_identificacion_destinatario_fk, g.numero_identificacion_destinatario)
              : null,
            mono: true,
          },
          { label: 'Teléfono', valor: g.telefono_destinatario },
          { label: 'Dirección', valor: g.direccion_destinatario, completo: true },
        ],
      },
      {
        titulo: 'Ruta y operación',
        campos: [
          { label: 'Origen', valor: g.ciudad_origen_nombre ?? g.codigo_ciudad_origen_fk },
          { label: 'Destino', valor: g.ciudad_destino_nombre ?? g.codigo_ciudad_destino_fk },
          {
            label: 'Operación de ingreso',
            valor: g.operacion_ingreso_nombre ?? g.codigo_operacion_ingreso_fk,
          },
          {
            label: 'Operación de cargo',
            valor: g.operacion_cargo_nombre ?? g.codigo_operacion_cargo_fk,
          },
          { label: 'Ruta', valor: g.codigo_ruta_fk },
          { label: 'Zona', valor: g.codigo_zona_fk },
          { label: 'Orden en ruta', valor: g.orden_ruta },
          { label: 'Despacho', valor: g.codigo_despacho_fk, mono: true },
          { label: 'Factura', valor: g.numero_factura, mono: true },
        ],
      },
    ],
    mercancia: {
      titulo: 'Mercancía y valores',
      campos: [
        { label: 'Unidades', valor: cantidad(g.unidades) },
        { label: 'Peso real', valor: peso(g.peso_real) },
        { label: 'Peso volumen', valor: peso(g.peso_volumen) },
        { label: 'Peso facturado', valor: peso(g.peso_facturado) },
        { label: 'Declarado', valor: dinero(g.vr_declara) },
        { label: 'Recaudo', valor: dinero(g.vr_recaudo) },
        { label: 'Abono', valor: dinero(g.vr_abono) },
        { label: 'Cobro en entrega', valor: dinero(g.vr_cobro_entrega) },
        { label: 'Flete', valor: dinero(g.vr_flete) },
        { label: 'Manejo', valor: dinero(g.vr_manejo) },
        { label: 'Otros', valor: dinero(g.vr_otros) },
        {
          label: 'Total',
          valor: dinero((g.vr_flete ?? 0) + (g.vr_manejo ?? 0) + g.vr_otros),
          destacado: true,
          completo: true,
        },
      ],
    },
  };
}

/** Línea de tiempo armada con las fechas de estado de la guía. */
export function seguimientoGuia(g: GuiaDetalle): PasoSeguimiento[] {
  return [
    {
      titulo: 'Recogida',
      icono: 'pi pi-clipboard',
      fecha: g.fecha_recogido,
      completado: g.estado_recogido,
    },
    {
      titulo: 'Ingreso a bodega de origen',
      icono: 'pi pi-home',
      fecha: g.fecha_ingreso_operacion ?? g.fecha_ingreso,
      completado: g.estado_ingreso,
    },
    {
      titulo: g.estado_despachado ? 'Despachada' : 'Pendiente de despacho',
      icono: 'pi pi-truck',
      fecha: g.fecha_despacho,
      completado: g.estado_despachado,
      detalle: g.codigo_despacho_fk
        ? `Despacho ${g.codigo_despacho_fk}` +
          (g.cantidad_despachos > 1 ? ` · ${g.cantidad_despachos} despachos` : '')
        : undefined,
    },
    {
      titulo: g.estado_entregado ? 'Entregada' : 'Pendiente de entrega',
      icono: 'pi pi-thumbs-up',
      fecha: g.fecha_entrega,
      completado: g.estado_entregado,
    },
    {
      titulo: 'Cumplida',
      icono: 'pi pi-check-circle',
      fecha: g.fecha_cumplido,
      completado: g.estado_cumplido,
    },
  ];
}

/** Posición del último paso cumplido, o `-1` si la guía aún no registra movimientos. */
export function ultimoPasoCompletado(pasos: PasoSeguimiento[]): number {
  return pasos.reduce((ultimo, paso, indice) => (paso.completado ? indice : ultimo), -1);
}
