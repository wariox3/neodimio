import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DatePipe } from '@angular/common';
import {
  PageHeaderComponent,
  LoadingSpinnerComponent,
  EmptyStateComponent,
  ErrorAlertComponent,
} from '../../../../shared';
import { SolicitudesService } from '../../services/solicitudes.service';
import { EstadoSolicitud, SolicitudEmpleado } from '../../models/solicitud.model';
import { extractErrorMessage } from '@semantica/core';
import { TableLazyLoadEvent, TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { TagModule } from 'primeng/tag';
import { AuthService } from '../../../auth/services/auth.service';
import { SolicitudCreateDialogComponent } from '../../components/solicitud-create-dialog/solicitud-create-dialog.component';
import { FicherosDialogComponent } from '@semantica/ui';

interface EstadoTag {
  label: string;
  severity: 'success' | 'info' | 'warn' | 'secondary' | 'contrast' | 'danger';
}

const ESTADO_MAP: Record<EstadoSolicitud, EstadoTag> = {
  A: { label: 'Aceptado', severity: 'success' },
  R: { label: 'Rechazado', severity: 'danger' },
};

const ESTADO_PENDIENTE: EstadoTag = { label: 'Pendiente', severity: 'warn' };

function esEstadoConocido(codigo: string): codigo is EstadoSolicitud {
  return codigo in ESTADO_MAP;
}

@Component({
  selector: 'app-solicitudes-list',
  standalone: true,
  imports: [
    PageHeaderComponent,
    LoadingSpinnerComponent,
    EmptyStateComponent,
    ErrorAlertComponent,
    TableModule,
    ButtonModule,
    TooltipModule,
    DatePipe,
    SolicitudCreateDialogComponent,
    FicherosDialogComponent,
    TagModule,
  ],
  templateUrl: './solicitudes-list.component.html',
  styleUrl: './solicitudes-list.component.scss',
})
export class SolicitudesListComponent implements OnInit {
  private readonly solicitudesService = inject(SolicitudesService);
  private readonly authService = inject(AuthService);
  private readonly destroyRef = inject(DestroyRef);

  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly solicitudes = signal<SolicitudEmpleado[]>([]);
  readonly totalRecords = signal(0);
  readonly pageSize = signal(50);
  readonly first = signal(0);
  readonly dialogVisible = signal(false);
  readonly ficherosDialogVisible = signal(false);
  readonly selectedSolicitudId = signal(0);

  ngOnInit(): void {
    this.loadSolicitudes(1);
  }

  loadSolicitudes(page: number): void {
    const user = this.authService.currentUser();

    if (!user?.empleado_id) {
      this.loading.set(false);
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    this.solicitudesService
      .getSolicitudes({ page, size: this.pageSize(), empleado_id: user.empleado_id })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.solicitudes.set(res.items);
          this.totalRecords.set(res.total);
          this.loading.set(false);
        },
        error: (err) => {
          this.error.set(extractErrorMessage(err, 'No se pudieron cargar las solicitudes.'));
          this.loading.set(false);
        },
      });
  }

  onLazyLoad(event: TableLazyLoadEvent): void {
    const first = event.first ?? 0;
    const rows = event.rows ?? this.pageSize();
    this.first.set(first);
    this.pageSize.set(rows);
    this.loadSolicitudes(Math.floor(first / rows) + 1);
  }

  onNuevo(): void {
    this.dialogVisible.set(true);
  }

  onSolicitudCreated(): void {
    this.loadSolicitudes(1);
  }

  getEstadoSolicitud(estado: string): EstadoTag {
    const codigo = estado?.toUpperCase() ?? '';
    return esEstadoConocido(codigo) ? ESTADO_MAP[codigo] : ESTADO_PENDIENTE;
  }

  onAdjuntos(solicitud: SolicitudEmpleado): void {
    this.selectedSolicitudId.set(solicitud.codigo_solicitud_empleado_pk);
    this.ficherosDialogVisible.set(true);
  }
}
