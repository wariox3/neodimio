export interface ColumnaCsv<T> {
  titulo: string;
  valor: (fila: T) => string | number | boolean | null | undefined;
}

/**
 * Neutraliza fórmulas: Excel ejecuta el texto que empieza por `=`, `+`, `-` o `@`,
 * y estos datos los escriben terceros (nombres, direcciones, comentarios).
 */
function celda(valor: string | number | boolean | null | undefined): string {
  if (valor === null || valor === undefined) return '""';
  if (typeof valor === 'boolean') return valor ? '"SI"' : '"NO"';
  if (typeof valor === 'number') return `"${valor}"`;
  const texto = /^[=+\-@\t\r]/.test(valor) ? `'${valor}` : valor;
  return `"${texto.replace(/"/g, '""')}"`;
}

/**
 * Descarga las filas como CSV que Excel abre directamente: separador `;` (el de la
 * configuración regional de Colombia) y BOM para que respete las tildes.
 */
export function descargarCsv<T>(nombre: string, columnas: ColumnaCsv<T>[], filas: T[]): void {
  const lineas = [
    columnas.map((c) => celda(c.titulo)).join(';'),
    ...filas.map((fila) => columnas.map((c) => celda(c.valor(fila))).join(';')),
  ];
  const blob = new Blob([`\uFEFF${lineas.join('\r\n')}`], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const enlace = document.createElement('a');
  enlace.href = url;
  enlace.download = `${nombre}.csv`;
  enlace.click();
  URL.revokeObjectURL(url);
}
