import { Component, computed, input } from '@angular/core';
import { TooltipModule } from 'primeng/tooltip';
import { ProgramacionEmpleado, TurnoCalendario } from '../../models/turno.model';
import { buildCalendarioMensual } from '../../helpers/turno.helper';

const TURNO_COLORES = [
  'var(--p-blue-500)',
  'var(--p-green-500)',
  'var(--p-orange-500)',
  'var(--p-purple-500)',
  'var(--p-red-500)',
  'var(--p-teal-500)',
  'var(--p-yellow-500)',
  'var(--p-cyan-500)',
  'var(--p-pink-500)',
  'var(--p-indigo-500)',
  'var(--p-lime-500)',
  'var(--p-amber-500)',
  'var(--p-violet-500)',
  'var(--p-emerald-500)',
  'var(--p-rose-500)',
  'var(--p-sky-500)',
  'var(--p-fuchsia-500)',
  'var(--p-slate-500)',
];

@Component({
  selector: 'app-programacion-calendar',
  standalone: true,
  imports: [TooltipModule],
  templateUrl: './programacion-calendar.component.html',
  styleUrl: './programacion-calendar.component.scss',
})
export class ProgramacionCalendarComponent {
  readonly programaciones = input.required<ProgramacionEmpleado[]>();
  readonly diaActual = input.required<number>();

  readonly diasSemana = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

  readonly semanas = computed(() => {
    const hoy = new Date();
    return buildCalendarioMensual(this.programaciones(), hoy.getFullYear(), hoy.getMonth() + 1);
  });

  readonly puestoColorMap = computed(() => {
    const puestos = new Set<string>();
    for (const prog of this.programaciones()) {
      puestos.add(prog.puesto_nombre);
    }
    const map = new Map<string, string>();
    let i = 0;
    for (const puesto of puestos) {
      map.set(puesto, TURNO_COLORES[i % TURNO_COLORES.length]);
      i++;
    }
    return map;
  });

  readonly leyendaPuestos = computed(() => {
    return Array.from(this.puestoColorMap()).map(([puesto, color]) => ({ puesto, color }));
  });

  getPuestoColor(puesto: string): string {
    return this.puestoColorMap().get(puesto) ?? 'var(--p-surface-400)';
  }

  buildCellTooltip(turnos: TurnoCalendario[]): string {
    return turnos.map((t) => `${t.codigo} — ${t.cliente} · ${t.puesto}`).join('\n');
  }
}
