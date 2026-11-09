/** Filas por página de las tablas paginadas contra el backend; el paginador no ofrece otro tamaño. */
export const DATA_TABLE_PAGE_SIZE = 25;

export type DataTableColumnType = 'text' | 'number' | 'currency' | 'date' | 'datetime';

/** Columna de la tabla: la pantalla las declara y la tabla pinta encabezado y celda. */
export interface DataTableColumn<T> {
  /** Campo de la fila; también identifica la columna para `appDataTableCell`. */
  readonly field: string;
  readonly header: string;
  /** Formato del valor. Por defecto, `text`. */
  readonly type?: DataTableColumnType;
  /** Valor derivado, cuando la celda no es un campo directo de la fila. */
  readonly value?: (row: T) => unknown;
  /** Texto de ayuda para encabezados abreviados. */
  readonly tooltip?: string;
  readonly align?: 'left' | 'right' | 'center';
  readonly width?: string;
  /** Ancho máximo: el texto que no cabe se corta con puntos suspensivos. */
  readonly maxWidth?: string;
  readonly nowrap?: boolean;
}

/** Acción de una fila; `inline` la muestra como botón, si no va en el menú ⋮. */
export interface DataTableRowAction<T> {
  readonly id: string;
  readonly label: string;
  readonly icon: string;
  readonly inline?: boolean;
  readonly severity?: 'default' | 'danger';
  readonly visibleFor?: (row: T) => boolean;
  /** Etiqueta accesible propia de la fila (ej. `Ver detalle de la guía 123`). */
  readonly ariaLabelFor?: (row: T) => string;
}

export interface DataTableRowActionEvent<T> {
  readonly actionId: string;
  readonly row: T;
}
