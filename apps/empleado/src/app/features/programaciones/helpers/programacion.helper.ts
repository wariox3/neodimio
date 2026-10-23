import { ProgramacionEmpleado } from '../models/programacion.model';

/** Extrae los códigos de turno únicos de todas las programaciones (campos dia_1..dia_31). */
export function extraerTurnosUnicos(programaciones: ProgramacionEmpleado[]): string[] {
  const turnosSet = new Set<string>();

  for (const prog of programaciones) {
    for (let d = 1; d <= 31; d++) {
      const valor = prog[`dia_${d}` as keyof ProgramacionEmpleado] as string | null;
      if (valor) {
        turnosSet.add(valor);
      }
    }
  }

  return [...turnosSet];
}
