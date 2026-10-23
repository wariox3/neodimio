import { Component, computed, input } from '@angular/core';
import { DatePipe } from '@angular/common';
import { DetalleVencimiento } from '../../models/turno.model';

type EstadoVencimiento = 'vigente' | 'vencido' | 'sin-definir';

interface ItemVencimiento {
  label: string;
  fecha: string | null;
  estado: EstadoVencimiento;
}

@Component({
  selector: 'app-vencimientos-card',
  standalone: true,
  imports: [DatePipe],
  templateUrl: './vencimientos-card.component.html',
  styleUrl: './vencimientos-card.component.scss',
})
export class VencimientosCardComponent {
  readonly vencimientos = input<DetalleVencimiento | null>(null);
  readonly loading = input(false);

  readonly items = computed<ItemVencimiento[]>(() => {
    const v = this.vencimientos();
    if (!v) return [];

    return [
      { label: 'Acreditación', fecha: v.fecha_acreditacion, estado: this.getEstado(v.fecha_acreditacion) },
      { label: 'Polígono', fecha: v.fecha_poligono, estado: this.getEstado(v.fecha_poligono) },
      { label: 'Psicofísico', fecha: v.fecha_psicofisico, estado: this.getEstado(v.fecha_psicofisico) },
      { label: 'Psicosensométrico', fecha: v.fecha_psicosensometrico, estado: this.getEstado(v.fecha_psicosensometrico) },
    ];
  });

  private getEstado(fecha: string | null): EstadoVencimiento {
    if (!fecha) return 'sin-definir';
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const fechaDate = new Date(fecha + 'T00:00:00');
    return fechaDate < hoy ? 'vencido' : 'vigente';
  }
}
