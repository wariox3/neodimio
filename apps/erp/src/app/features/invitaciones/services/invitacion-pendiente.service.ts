import { Injectable, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { BaseHttpService, API_ENDPOINTS, PaginatedResponse } from '../../../core';
import { InvitacionPendiente } from '../models/invitacion.model';

@Injectable({ providedIn: 'root' })
export class InvitacionPendienteService extends BaseHttpService {
  private readonly _invitaciones = signal<InvitacionPendiente[]>([]);
  private readonly _total = signal(0);

  readonly invitaciones = this._invitaciones.asReadonly();
  readonly total = this._total.asReadonly();

  clearCache(): void {
    this._invitaciones.set([]);
    this._total.set(0);
  }

  /**
   * Invitaciones pendientes enviadas por la empresa, de la más reciente a la más
   * antigua. Solo para su propietario (`control`).
   */
  getPendientes(
    tenantId: number,
    page = 1,
    size = 10,
  ): Observable<PaginatedResponse<InvitacionPendiente>> {
    return this.get<PaginatedResponse<InvitacionPendiente>>(API_ENDPOINTS.invitacion.lista, {
      tenant_id: tenantId,
      estado: 'pendiente',
      page,
      size,
    }).pipe(
      tap((res) => {
        this._invitaciones.set(res.items);
        this._total.set(res.total);
      }),
    );
  }
}
