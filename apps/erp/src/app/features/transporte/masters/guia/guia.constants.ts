import type { BreadcrumbItem, DataTableColumn, DataTableRowAction } from '@semantica/ui';
import { ROUTE_PATHS } from '@erp/core';
import { GuiaFila } from './guia.model';

export type GuiaEstadoFiltro = 'en_bodega' | 'despachadas' | 'entregadas' | 'con_novedad';

/** Opciones del filtro de estado del listado. */
export const GUIA_ESTADO_OPCIONES: readonly { value: GuiaEstadoFiltro; label: string }[] = [
  { value: 'en_bodega', label: 'En bodega' },
  { value: 'despachadas', label: 'Despachadas' },
  { value: 'entregadas', label: 'Entregadas' },
  { value: 'con_novedad', label: 'Con novedad' },
];

/**
 * Parámetros de fluor para cada estado. Los estados de una guía se acumulan (una despachada
 * sigue con `estado_ingreso`), así que se excluye el siguiente para que cada opción traiga
 * solo las guías que el listado muestra con ese estado.
 *
 * Excepción: `entregadas` también trae las cumplidas, porque fluor no filtra por `estado_cumplido`.
 */
export const GUIA_ESTADO_PARAMS: Record<GuiaEstadoFiltro, Record<string, boolean>> = {
  en_bodega: { estado_ingreso: true, estado_despachado: false, estado_anulado: false },
  despachadas: { estado_despachado: true, estado_entregado: false, estado_anulado: false },
  entregadas: { estado_entregado: true, estado_anulado: false },
  con_novedad: { estado_novedad: true, estado_anulado: false },
};

/** Mayor número de guía que acepta la columna entera de fluor. */
export const GUIA_NUMERO_MAXIMO = 2147483647;

/** Valores de `tipo_liquidacion` con los que fluor calcula el flete. */
export const TIPOS_LIQUIDACION: Readonly<Record<string, string>> = {
  K: 'Por kilo',
  U: 'Por unidad',
};

export const TRANSPORTE_MIGA_RAIZ: BreadcrumbItem = {
  label: 'Transporte',
  routerLink: ROUTE_PATHS.dashboard.transporte.inicio,
};

export const GUIAS_COLUMNS: readonly DataTableColumn<GuiaFila>[] = [
  { field: 'codigo_guia_pk', header: 'Guía' },
  { field: 'fecha_ingreso', header: 'Fecha', type: 'datetime' },
  { field: 'documento_cliente', header: 'Documento' },
  { field: 'remitente', header: 'Remitente', maxWidth: '200px' },
  { field: 'nombre_destinatario', header: 'Destinatario', maxWidth: '200px' },
  { field: 'origen_nombre', header: 'Origen', nowrap: true },
  { field: 'destino_nombre', header: 'Destino', nowrap: true },
  { field: 'unidades', header: 'Und', tooltip: 'Unidades', type: 'number', align: 'right' },
  {
    field: 'peso_facturado',
    header: 'Peso',
    tooltip: 'Peso facturado (kg)',
    type: 'number',
    align: 'right',
  },
  { field: 'vr_declara', header: 'Declarado', type: 'currency', align: 'right' },
  { field: 'vr_flete', header: 'Flete', type: 'currency', align: 'right' },
  { field: 'vr_manejo', header: 'Manejo', type: 'currency', align: 'right' },
  { field: 'estado', header: 'Estado' },
];

export const GUIA_ACCION_VER = 'ver';

export const GUIAS_ROW_ACTIONS: readonly DataTableRowAction<GuiaFila>[] = [
  {
    id: GUIA_ACCION_VER,
    label: 'Ver detalle',
    icon: 'pi pi-eye',
    inline: true,
    ariaLabelFor: (guia) => `Ver detalle de la guía ${guia.codigo_guia_pk}`,
  },
];
