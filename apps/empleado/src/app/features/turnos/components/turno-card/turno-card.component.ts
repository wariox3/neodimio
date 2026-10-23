import { Component, computed, input, output } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { TurnoDelDia } from '../../models/turno.model';

const MODALIDAD_LABELS: Record<string, string> = {
  ANL: 'Arma no letal',
  CAR: 'Con arma',
  SAR: 'Sin arma',
};

@Component({
  selector: 'app-turno-card',
  standalone: true,
  imports: [ButtonModule],
  templateUrl: './turno-card.component.html',
  styleUrl: './turno-card.component.scss',
})
export class TurnoCardComponent {
  readonly turno = input<TurnoDelDia | null>(null);
  readonly titulo = input.required<string>();
  readonly subtitulo = input.required<string>();
  readonly icono = input.required<string>();
  readonly activo = input(false);
  readonly emptyIcon = input.required<string>();
  readonly emptyTitle = input.required<string>();
  readonly emptyMessage = input.required<string>();

  readonly verConsignas = output<TurnoDelDia>();

  readonly modalidadLabel = computed(() => {
    const codigo = this.turno()?.codigo_modalidad_fk;
    return codigo ? (MODALIDAD_LABELS[codigo] ?? codigo) : null;
  });
}
