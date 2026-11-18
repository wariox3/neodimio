import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { API_ENDPOINTS, BaseHttpService, PaginatedResponse } from '../../../core';
import { InvitacionRecibida } from '../models/contenedor.model';

/** Tope de invitaciones pendientes que se traen de una vez. */
const MAX_INVITACIONES = 50;

/**
 * Invitaciones a empresas que recibe el usuario. Las envía un usuario control desde el ERP;
 * al aceptarla el usuario queda en la empresa y el administrador lo habilita como cliente.
 */
@Injectable({ providedIn: 'root' })
export class InvitacionService extends BaseHttpService {
  /** Invitaciones pendientes del usuario, de la más reciente a la más antigua. */
  getPendientes(): Observable<InvitacionRecibida[]> {
    return this.get<PaginatedResponse<InvitacionRecibida>>(API_ENDPOINTS.invitacion.pendientes, {
      page: 1,
      size: MAX_INVITACIONES,
    }).pipe(map((res) => res?.items ?? []));
  }

  aceptar(invitacionId: number): Observable<unknown> {
    return this.post<unknown>(API_ENDPOINTS.invitacion.aceptar(invitacionId), {});
  }

  /** Rechaza la invitación; no se puede deshacer. */
  rechazar(invitacionId: number): Observable<unknown> {
    return this.post<unknown>(API_ENDPOINTS.invitacion.rechazar(invitacionId), {});
  }
}
