import { Component, inject, input, model, signal } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { TurnosService } from '../../services/turnos.service';
import { Consigna, TurnoDelDia } from '../../models/turno.model';

@Component({
  selector: 'app-consignas-dialog',
  standalone: true,
  imports: [DialogModule, ButtonModule],
  templateUrl: './consignas-dialog.component.html',
  styleUrl: './consignas-dialog.component.scss',
})
export class ConsignasDialogComponent {
  private readonly turnosService = inject(TurnosService);

  readonly visible = model(false);
  readonly turno = input<TurnoDelDia | null>(null);

  readonly consignas = signal<Consigna[]>([]);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  onShow(): void {
    const t = this.turno();
    if (!t) return;

    const puestoId = Number(t.codigo_puesto_fk);
    if (!puestoId) return;

    this.loading.set(true);
    this.turnosService.getConsignas(puestoId).subscribe({
      next: (res) => {
        this.consignas.set(res.items);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('No se pudieron cargar las consignas.');
        this.loading.set(false);
      },
    });
  }

  onHide(): void {
    this.consignas.set([]);
    this.error.set(null);
    this.loading.set(false);
  }
}
