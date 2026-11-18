import { APP_LOCALE } from '@semantica/core';
import { VALOR_VACIO, formatCellValue } from './data-table.format';

describe('formatCellValue', () => {
  it('deja vacíos los valores sin dato', () => {
    for (const valor of [null, undefined, '']) {
      expect(formatCellValue(valor, 'currency', 'en-US')).toBe(VALOR_VACIO);
    }
  });

  it('conserva el cero, que sí es un dato', () => {
    expect(formatCellValue(0, 'number', 'en-US')).toBe('0');
    expect(formatCellValue(0, 'currency', 'en-US')).toBe('$ 0');
  });

  it('acepta números que llegan como texto', () => {
    expect(formatCellValue('120600.000000', 'currency', 'en-US')).toBe('$ 120,600');
    expect(formatCellValue('12.4', 'number', 'en-US')).toBe('12');
  });

  it('usa el formato colombiano sin decimales', () => {
    expect(formatCellValue(1500000, 'currency', APP_LOCALE)).toBe('$ 1.500.000');
    expect(formatCellValue(53396.6, 'number', APP_LOCALE)).toBe('53.397');
  });

  it('no pinta NaN ni falla con valores que no se pueden formatear', () => {
    expect(formatCellValue('abc', 'number', 'en-US')).toBe(VALOR_VACIO);
    expect(formatCellValue('abc', 'currency', 'en-US')).toBe(VALOR_VACIO);
    expect(formatCellValue('no-es-fecha', 'datetime', 'en-US')).toBe(VALOR_VACIO);
  });

  it('formatea fechas con el formato del sistema', () => {
    expect(formatCellValue('2026-11-05T15:40:00', 'date', 'en-US')).toBe('05/11/2026');
    expect(formatCellValue('2026-11-05T15:40:00', 'datetime', 'en-US')).toBe('05/11/2026 15:40');
  });

  it('sin tipo devuelve el texto tal cual', () => {
    expect(formatCellValue('FAC-1', undefined, 'en-US')).toBe('FAC-1');
  });
});
