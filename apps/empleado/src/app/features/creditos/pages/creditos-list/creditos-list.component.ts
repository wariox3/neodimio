import { Component, inject, OnInit, signal } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import {
  PageHeaderComponent,
  LoadingSpinnerComponent,
  EmptyStateComponent,
  ErrorAlertComponent,
} from '../../../../shared';
import { extractErrorMessage } from '@semantica/core';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { CreditosService } from '../../services/creditos.service';
import { CreditoSolicitud } from '../../models/credito.model';
import { CreditoSolicitudComponent } from '../../components/credito-solicitud/credito-solicitud.component';

const ESTADO_MAP: Record<
  string,
  { label: string; severity: 'success' | 'info' | 'warn' | 'secondary' | 'danger' | 'contrast' }
> = {
  pendiente: { label: 'Pendiente', severity: 'warn' },
  aprobado: { label: 'Aprobado', severity: 'info' },
  desembolsado: { label: 'Desembolsado', severity: 'success' },
  rechazado: { label: 'Rechazado', severity: 'danger' },
  pagado: { label: 'Pagado', severity: 'secondary' },
};

@Component({
  selector: 'app-creditos-list',
  standalone: true,
  imports: [
    CurrencyPipe,
    DatePipe,
    PageHeaderComponent,
    LoadingSpinnerComponent,
    EmptyStateComponent,
    ErrorAlertComponent,
    TableModule,
    ButtonModule,
    TagModule,
    CreditoSolicitudComponent,
  ],
  templateUrl: './creditos-list.component.html',
  styleUrl: './creditos-list.component.scss',
})
export class CreditosListComponent implements OnInit {
  private readonly creditosService = inject(CreditosService);

  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly creditos = signal<CreditoSolicitud[]>([]);
  readonly showSolicitud = signal(false);

  ngOnInit(): void {
    this.loadCreditos();
  }

  loadCreditos(): void {
    this.loading.set(true);
    this.error.set(null);

    this.creditosService.getCreditos().subscribe({
      next: (items) => {
        this.creditos.set(items);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(extractErrorMessage(err, 'No se pudieron cargar los créditos.'));
        this.loading.set(false);
      },
    });
  }

  onNuevo(): void {
    this.showSolicitud.set(true);
  }

  onCreditoCreated(): void {
    this.showSolicitud.set(false);
    this.loadCreditos();
  }

  getEstado(credito: CreditoSolicitud): {
    label: string;
    severity: 'success' | 'info' | 'warn' | 'secondary' | 'danger' | 'contrast';
  } {
    return ESTADO_MAP[credito.estado] ?? { label: credito.estado, severity: 'contrast' as const };
  }
}
