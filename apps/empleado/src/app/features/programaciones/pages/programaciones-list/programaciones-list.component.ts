import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { forkJoin } from 'rxjs';
import { getMesAnioLabel, getSiguienteMes } from '@semantica/core';
import { AuthService } from '../../../auth/services/auth.service';
import { ProgramacionesService } from '../../services/programaciones.service';
import { ProgramacionEmpleado, Turno } from '../../models/programacion.model';
import { extraerTurnosUnicos } from '../../helpers/programacion.helper';
import { PageHeaderComponent, LoadingSpinnerComponent, EmptyStateComponent } from '@semantica/ui';
import { ProgramacionTableComponent } from '../../components/programacion-table/programacion-table.component';
import { ProgramacionesLegendComponent } from '../../components/programaciones-legend/programaciones-legend.component';

@Component({
  selector: 'app-programaciones-list',
  standalone: true,
  imports: [
    PageHeaderComponent,
    LoadingSpinnerComponent,
    EmptyStateComponent,
    ProgramacionTableComponent,
    ProgramacionesLegendComponent,
  ],
  templateUrl: './programaciones-list.component.html',
  styleUrl: './programaciones-list.component.scss',
})
export class ProgramacionesListComponent implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly programacionesService = inject(ProgramacionesService);

  private readonly hoy = new Date();
  readonly mesActual = this.hoy.getMonth() + 1;
  readonly anioActual = this.hoy.getFullYear();

  private readonly siguiente = getSiguienteMes(this.mesActual, this.anioActual);
  readonly mesSiguiente = this.siguiente.mes;
  readonly anioSiguiente = this.siguiente.anio;

  readonly nombreMesActual = getMesAnioLabel(this.mesActual, this.anioActual);
  readonly nombreMesSiguiente = getMesAnioLabel(this.mesSiguiente, this.anioSiguiente);

  readonly programaciones = signal<ProgramacionEmpleado[]>([]);
  readonly programacionesSiguiente = signal<ProgramacionEmpleado[]>([]);
  readonly turnos = signal<Turno[]>([]);
  readonly loading = signal(true);

  readonly diaActual = this.hoy.getDate();

  readonly diasDelMes = computed(() => {
    const total = new Date(this.anioActual, this.mesActual, 0).getDate();
    return Array.from({ length: total }, (_, i) => i + 1);
  });

  readonly diasDelMesSiguiente = computed(() => {
    const total = new Date(this.anioSiguiente, this.mesSiguiente, 0).getDate();
    return Array.from({ length: total }, (_, i) => i + 1);
  });

  ngOnInit(): void {
    const user = this.authService.currentUser();
    if (!user?.empleado_id) {
      this.loading.set(false);
      return;
    }

    const id = user.empleado_id;

    forkJoin({
      actual: this.programacionesService.getProgramacionEmpleado(id, this.anioActual, this.mesActual),
      siguiente: this.programacionesService.getProgramacionEmpleado(
        id,
        this.anioSiguiente,
        this.mesSiguiente,
      ),
    }).subscribe({
      next: ({ actual, siguiente }) => {
        this.programaciones.set(actual);
        this.programacionesSiguiente.set(siguiente);
        this.loading.set(false);
        this.cargarTurnosProgramacion([...actual, ...siguiente]);
      },
      error: () => this.loading.set(false),
    });
  }

  private cargarTurnosProgramacion(programaciones: ProgramacionEmpleado[]): void {
    const turnosUnicos = extraerTurnosUnicos(programaciones);
    if (turnosUnicos.length === 0) return;

    this.programacionesService.getTurnosProgramacion(turnosUnicos).subscribe({
      next: (response) => this.turnos.set(response.items),
    });
  }
}
