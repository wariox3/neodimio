import { Observable, forkJoin, map } from 'rxjs';
import {
  DiaCalendario,
  ProgramacionEmpleado,
  TurnoCalendario,
  TurnoDelDia,
} from '../models/turno.model';
import { TurnosService } from '../services/turnos.service';

export interface FechaInfo {
  dia: number;
  mes: number;
  anio: number;
}

export interface TurnosData {
  turnoHoy: TurnoDelDia | null;
  turnoManana: TurnoDelDia | null;
  programaciones: ProgramacionEmpleado[];
}

/** Calcula las fechas de hoy y mañana desglosadas en día, mes y año. */
export function calcularFechasHoyManana(): { hoy: FechaInfo; manana: FechaInfo } {
  const hoy = new Date();
  const manana = new Date(hoy);
  manana.setDate(manana.getDate() + 1);

  return {
    hoy: { dia: hoy.getDate(), mes: hoy.getMonth() + 1, anio: hoy.getFullYear() },
    manana: { dia: manana.getDate(), mes: manana.getMonth() + 1, anio: manana.getFullYear() },
  };
}

/**
 * Obtiene los turnos de hoy y mañana junto con las programaciones del mes actual.
 * Si hoy y mañana están en meses distintos, hace dos llamadas paralelas con `forkJoin`.
 */
export function obtenerTurnosHoyManana(
  turnosService: TurnosService,
  empleadoId: number,
): Observable<TurnosData> {
  const { hoy, manana } = calcularFechasHoyManana();
  const mismoMes = hoy.mes === manana.mes && hoy.anio === manana.anio;

  if (mismoMes) {
    return turnosService.getProgramacionEmpleado(empleadoId, hoy.anio, hoy.mes).pipe(
      map((programaciones) => ({
        turnoHoy: findTurnoForDay(programaciones, hoy.dia),
        turnoManana: findTurnoForDay(programaciones, manana.dia),
        programaciones,
      })),
    );
  }

  return forkJoin([
    turnosService.getProgramacionEmpleado(empleadoId, hoy.anio, hoy.mes),
    turnosService.getProgramacionEmpleado(empleadoId, manana.anio, manana.mes),
  ]).pipe(
    map(([progHoy, progManana]) => ({
      turnoHoy: findTurnoForDay(progHoy, hoy.dia),
      turnoManana: findTurnoForDay(progManana, manana.dia),
      programaciones: progHoy,
    })),
  );
}

/** Busca en las programaciones la primera que tenga un turno asignado para el día indicado. */
export function findTurnoForDay(
  programaciones: ProgramacionEmpleado[],
  dia: number,
): TurnoDelDia | null {
  const key = `dia_${dia}` as keyof ProgramacionEmpleado;

  for (const prog of programaciones) {
    const turnoValue = prog[key];
    if (turnoValue) {
      return {
        puesto_nombre: prog.puesto_nombre,
        puesto_direccion: prog.puesto_direccion,
        codigo_puesto_fk: prog.codigo_puesto_fk,
        coordinador_nombre: prog.coordinador_nombre,
        programador_nombre: prog.programador_nombre,
        codigo_modalidad_fk: prog.codigo_modalidad_fk,
        tercero_nombre_corto: prog.tercero_nombre_corto,
        turno: turnoValue as string,
      };
    }
  }

  return null;
}

/** Construye una estructura de semanas con días para renderizar un calendario mensual. */
export function buildCalendarioMensual(
  programaciones: ProgramacionEmpleado[],
  anio: number,
  mes: number,
): DiaCalendario[][] {
  const totalDias = new Date(anio, mes, 0).getDate();
  const primerDiaSemana = (new Date(anio, mes - 1, 1).getDay() + 6) % 7; // lunes=0

  const dias: DiaCalendario[] = [];

  // Padding antes del día 1
  for (let i = 0; i < primerDiaSemana; i++) {
    dias.push({ dia: 0, esDelMes: false, turnos: [] });
  }

  // Días del mes
  for (let d = 1; d <= totalDias; d++) {
    const key = `dia_${d}` as keyof ProgramacionEmpleado;
    const turnos: TurnoCalendario[] = [];

    for (const prog of programaciones) {
      const valor = prog[key];
      if (valor) {
        turnos.push({
          codigo: valor as string,
          cliente: prog.tercero_nombre_corto,
          puesto: prog.puesto_nombre,
        });
      }
    }

    dias.push({ dia: d, esDelMes: true, turnos });
  }

  // Padding después del último día para completar la última semana
  while (dias.length % 7 !== 0) {
    dias.push({ dia: 0, esDelMes: false, turnos: [] });
  }

  // Agrupar en semanas de 7 días
  const semanas: DiaCalendario[][] = [];
  for (let i = 0; i < dias.length; i += 7) {
    semanas.push(dias.slice(i, i + 7));
  }

  return semanas;
}

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
