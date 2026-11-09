import { formatDate, formatNumber } from '@angular/common';
import { DataTableColumnType } from './data-table.types';

export const VALOR_VACIO = '—';

/** Texto de una celda según el tipo de su columna; lo que no se puede formatear queda vacío. */
export function formatCellValue(
  value: unknown,
  type: DataTableColumnType | undefined,
  locale: string,
): string {
  if (value === null || value === undefined || value === '') return VALOR_VACIO;

  switch (type) {
    case 'number':
      return formatearNumero(value, locale, '1.0-0');
    case 'currency': {
      const monto = formatearNumero(value, locale, '1.0-0');
      return monto === VALOR_VACIO ? monto : `$ ${monto}`;
    }
    case 'date':
      return formatearFecha(value, 'dd/MM/yyyy', locale);
    case 'datetime':
      return formatearFecha(value, 'dd/MM/yyyy HH:mm', locale);
    default:
      return String(value);
  }
}

function formatearNumero(value: unknown, locale: string, formato: string): string {
  const numero = Number(value);
  return Number.isFinite(numero) ? formatNumber(numero, locale, formato) : VALOR_VACIO;
}

function formatearFecha(value: unknown, formato: string, locale: string): string {
  const fecha = new Date(value as string | number | Date);
  return Number.isNaN(fecha.getTime()) ? VALOR_VACIO : formatDate(fecha, formato, locale);
}
