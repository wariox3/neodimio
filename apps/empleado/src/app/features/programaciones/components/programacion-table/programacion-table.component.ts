import { Component, computed, input, signal } from '@angular/core';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { ProgramacionEmpleado } from '../../models/programacion.model';
import { ReporteCreateDialogComponent } from '../reporte-create-dialog/reporte-create-dialog.component';

@Component({
  selector: 'app-programacion-table',
  standalone: true,
  imports: [TableModule, ButtonModule, ReporteCreateDialogComponent],
  templateUrl: './programacion-table.component.html',
  styleUrl: './programacion-table.component.scss',
})
export class ProgramacionTableComponent {
  readonly programaciones = input.required<ProgramacionEmpleado[]>();
  readonly diasDelMes = input.required<number[]>();
  readonly mes = input.required<number>(); // 1-based
  readonly anio = input.required<number>();
  readonly diaActual = input(0);
  readonly titulo = input('Programación del mes');
  readonly subtitulo = input('Detalle completo de turnos asignados');

  readonly totalColumnas = computed(() => this.diasDelMes().length);

  getDayLabel(dia: number): string {
    const letters = ['D', 'L', 'M', 'X', 'J', 'V', 'S'];
    const dow = new Date(this.anio(), this.mes() - 1, dia).getDay();
    return `${dia}${letters[dow]}`;
  }

  readonly reporteDialogVisible = signal(false);
  readonly programacionSeleccionada = signal(0);

  abrirReporte(prog: ProgramacionEmpleado): void {
    this.programacionSeleccionada.set(prog.codigo_programacion_pk);
    this.reporteDialogVisible.set(true);
  }

  onReporteCreado(): void {
    // El diálogo ya muestra el toast de éxito
  }
}
