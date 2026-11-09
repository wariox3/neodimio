/** Días del mes tal como los trae fluor: `dia_1` … `dia_31`. */
export type DiaProgramacion = `dia_${number}`;

/** Programación de un empleado en un puesto del cliente (`ProgramacionResponse` de fluor). */
export interface Programacion {
  codigo_programacion_pk: number;
  codigo_puesto_fk: number | null;
  codigo_empleado_fk: number | null;
  anio: number | null;
  mes: number | null;
  puesto_nombre: string | null;
  empleado_nombre: string | null;
  cargo_nombre: string | null;
  modalidad_nombre: string | null;
  [dia: DiaProgramacion]: string | null;
}

/** Día del mes elegido, con la inicial del día de la semana para el encabezado. */
export interface DiaMes {
  numero: number;
  campo: DiaProgramacion;
  inicial: string;
  finDeSemana: boolean;
}

const INICIALES = ['D', 'L', 'M', 'M', 'J', 'V', 'S'];

/** Días del mes (28 a 31) con su día de la semana. */
export function diasDelMes(anio: number, mes: number): DiaMes[] {
  const total = new Date(anio, mes, 0).getDate();
  return Array.from({ length: total }, (_, i) => {
    const numero = i + 1;
    const semana = new Date(anio, mes - 1, numero).getDay();
    return {
      numero,
      campo: `dia_${numero}`,
      inicial: INICIALES[semana],
      finDeSemana: semana === 0 || semana === 6,
    };
  });
}

/**
 * Agrupa por puesto, como terbio: ordena por puesto y, dentro de cada uno, por empleado.
 * Fluor las entrega por id descendente, lo que separaría las filas de un mismo puesto.
 */
export function ordenarPorPuesto(programaciones: Programacion[]): Programacion[] {
  return [...programaciones].sort(
    (a, b) =>
      (a.codigo_puesto_fk ?? 0) - (b.codigo_puesto_fk ?? 0) ||
      (a.empleado_nombre ?? '').localeCompare(b.empleado_nombre ?? '') ||
      a.codigo_programacion_pk - b.codigo_programacion_pk,
  );
}
