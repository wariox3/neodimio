import { Component, input } from '@angular/core';
import { Turno } from '../../models/programacion.model';

@Component({
  selector: 'app-programaciones-legend',
  standalone: true,
  templateUrl: './programaciones-legend.component.html',
  styleUrl: './programaciones-legend.component.scss',
})
export class ProgramacionesLegendComponent {
  readonly turnos = input<Turno[]>([]);
}
