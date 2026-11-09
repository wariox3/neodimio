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
 */
export const GUIA_ESTADO_PARAMS: Record<GuiaEstadoFiltro, Record<string, boolean>> = {
  en_bodega: { estado_ingreso: true, estado_despachado: false, estado_anulado: false },
  despachadas: { estado_despachado: true, estado_entregado: false, estado_anulado: false },
  entregadas: { estado_entregado: true, estado_anulado: false },
  con_novedad: { estado_novedad: true, estado_anulado: false },
};

/** Mayor número de guía que acepta la columna entera de fluor. */
export const GUIA_NUMERO_MAXIMO = 2147483647;
