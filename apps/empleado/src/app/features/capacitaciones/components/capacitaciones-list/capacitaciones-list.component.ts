import { Component, inject, OnInit, signal } from '@angular/core';
import {
  PageHeaderComponent,
  LoadingSpinnerComponent,
  EmptyStateComponent,
  ErrorAlertComponent,
} from '../../../../shared';
import { CapacitacionesService } from '../../services/capacitaciones.service';
import { CapacitacionDetalle } from '../../models/capacitacion.model';
import { CapacitacionCardComponent } from '../capacitacion-card/capacitacion-card.component';
import { extractErrorMessage } from '@semantica/core';
import { AuthService } from '../../../auth/services/auth.service';

@Component({
  selector: 'app-capacitaciones-list',
  standalone: true,
  imports: [
    PageHeaderComponent,
    LoadingSpinnerComponent,
    EmptyStateComponent,
    ErrorAlertComponent,
    CapacitacionCardComponent,
  ],
  templateUrl: './capacitaciones-list.component.html',
  styleUrl: './capacitaciones-list.component.scss',
})
export class CapacitacionesListComponent implements OnInit {
  private readonly capacitacionesService = inject(CapacitacionesService);
  private readonly authService = inject(AuthService);

  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly capacitaciones = signal<CapacitacionDetalle[]>([]);
  readonly total = signal(0);
  readonly page = signal(1);
  readonly size = signal(50);

  ngOnInit(): void {
    this.loadCapacitaciones();
  }

  onAsistenciaConfirmada(): void {
    this.loadCapacitaciones();
  }

  loadCapacitaciones(): void {
    const user = this.authService.currentUser();

    if (!user?.empleado_id) {
      this.loading.set(false);
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    this.capacitacionesService
      .getCapacitacionDetalles({
        empleado_id: user.empleado_id,
        page: this.page(),
        size: this.size(),
      })
      .subscribe({
        next: (response) => {
          this.capacitaciones.set(response.items);
          this.total.set(response.total);
          this.loading.set(false);
        },
        error: (err) => {
          this.error.set(extractErrorMessage(err, 'No se pudieron cargar las capacitaciones.'));
          this.loading.set(false);
        },
      });
  }
}
