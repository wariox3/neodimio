import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { API_ENDPOINTS, BaseHttpService, PaginatedResponse } from '../../../core';
import { InvitacionRecibida } from '../models/contenedor.model';

/** Tope de invitaciones pendientes que se traen de una vez. */
const MAX_INVITACIONES = 50;

/**
 * Invitaciones a empresas que recibe el usuario. Las envía un usuario control desde el ERP;
 * al aceptarla el usuario queda como cliente de la empresa y el administrador le asigna su
 * cliente (`cliente_id`) para que pueda ingresar.
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

  /**
   * Acepta la invitación desde el portal de clientes: con `cliente=true` fluor crea la
   * membresía como cliente (además del acceso al ERP). El `cliente_id` lo asigna el
   * administrador.
   */
  aceptar(invitacionId: number): Observable<unknown> {
    return this.post<unknown>(`${API_ENDPOINTS.invitacion.aceptar(invitacionId)}?cliente=true`, {});
  }

  /** Rechaza la invitación; no se puede deshacer. */
  rechazar(invitacionId: number): Observable<unknown> {
    return this.post<unknown>(API_ENDPOINTS.invitacion.rechazar(invitacionId), {});
  }
}
