import { DatePipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { TableModule, TableLazyLoadEvent } from 'primeng/table';
import { MessageService } from 'primeng/api';
import { PageHeaderComponent } from '../../../../shared';
import { InvitacionPendienteService } from '../../services/invitacion-pendiente.service';
import { InvitacionPendiente } from '../../models/invitacion.model';
import { ActiveTenantService, extractErrorMessage } from '../../../../core';

/** Lista de solo lectura con las invitaciones pendientes de la empresa activa. */
@Component({
  selector: 'app-invitacion-list',
  standalone: true,
  imports: [DatePipe, PageHeaderComponent, TableModule],
  templateUrl: './invitacion-list.component.html',
  styleUrl: './invitacion-list.component.scss',
})
export class InvitacionListComponent implements OnInit {
  private readonly invitacionService = inject(InvitacionPendienteService);
  private readonly messageService = inject(MessageService);
  /** Empresa activa del usuario conectado; la lista muestra sus invitaciones. */
  private readonly tenantId = inject(ActiveTenantService).tenantId;

  readonly invitaciones = this.invitacionService.invitaciones;
  readonly totalRecords = this.invitacionService.total;
  readonly loading = signal(true);
  readonly rows = signal(10);
  /** Índice de la primera fila mostrada por el paginador. */
  readonly first = signal(0);

  ngOnInit(): void {
    this.loadInvitaciones(1, this.rows());
  }

  onLazyLoad(event: TableLazyLoadEvent): void {
    const first = event.first ?? 0;
    const rows = event.rows ?? this.rows();
    this.first.set(first);
    this.rows.set(rows);
    this.loadInvitaciones(Math.floor(first / rows) + 1, rows);
  }

  loadInvitaciones(page: number, size: number): void {
    const tenantId = this.tenantId();
    if (tenantId === null) {
      this.loading.set(false);
      return;
    }

    this.loading.set(true);
    this.invitacionService.getPendientes(tenantId, page, size).subscribe({
      next: () => this.loading.set(false),
      error: (err: unknown) => {
        this.loading.set(false);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: extractErrorMessage(err, 'No se pudieron cargar las invitaciones.'),
        });
      },
    });
  }

  /** Nombre del invitado; cae al email si no tiene nombre cargado. */
  invitadoNombre(i: InvitacionPendiente): string {
    return i.usuario_invitado_nombre?.trim() || i.usuario_invitado_email;
  }

  /** Inicial para el avatar de la fila. */
  initial(i: InvitacionPendiente): string {
    return this.invitadoNombre(i).charAt(0).toUpperCase() || '?';
  }
}
