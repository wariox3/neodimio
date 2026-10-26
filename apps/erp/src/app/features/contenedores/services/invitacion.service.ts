import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { BaseHttpService, PaginatedResponse } from '../../../core';
import {
  ContenedorMiembro,
  InvitacionEmpresa,
  InvitacionRecibida,
  InvitacionRequest,
  UsuarioSeleccionar,
} from '../models/contenedor.model';

/** Sugerencias que muestra el buscador de usuarios a invitar. */
const MAX_SUGERENCIAS = 10;

/** Tope de miembros e invitaciones por empresa que se traen de una vez. */
const MAX_REGISTROS = 200;

@Injectable({ providedIn: 'root' })
export class InvitacionService extends BaseHttpService {
  /**
   * Usuarios activos y verificados cuyo correo, nombres o apellidos coinciden
   * con el término. Cualquier usuario autenticado puede consultarlo.
   */
  buscarUsuarios(buscar: string): Observable<UsuarioSeleccionar[]> {
    return this.get<PaginatedResponse<UsuarioSeleccionar>>('/auth/user/seleccionar', {
      buscar,
      page: 1,
      size: MAX_SUGERENCIAS,
    }).pipe(map((res) => res?.items ?? []));
  }

  /** Miembros ERP de la empresa (`erp=true`). Solo para su propietario (`control`). */
  getMiembros(tenantId: number): Observable<ContenedorMiembro[]> {
    return this.get<PaginatedResponse<ContenedorMiembro>>('/mas/user-tenant/lista-tenant', {
      tenant_id: tenantId,
      erp: true,
      page: 1,
      size: MAX_REGISTROS,
    }).pipe(map((res) => res?.items ?? []));
  }

  /** Invitaciones enviadas por la empresa, de la más reciente a la más antigua. Solo para su propietario. */
  getInvitaciones(tenantId: number): Observable<InvitacionEmpresa[]> {
    return this.get<PaginatedResponse<InvitacionEmpresa>>('/mas/invitacion/lista', {
      tenant_id: tenantId,
      page: 1,
      size: MAX_REGISTROS,
    }).pipe(map((res) => res?.items ?? []));
  }

  /** Envía una invitación. Solo puede hacerlo el propietario de la empresa. */
  invitar(payload: InvitacionRequest): Observable<unknown> {
    return this.post<unknown>('/mas/invitacion/nuevo', payload);
  }

  /** Invitaciones pendientes dirigidas al usuario autenticado. */
  getPendientes(): Observable<InvitacionRecibida[]> {
    return this.get<PaginatedResponse<InvitacionRecibida>>('/mas/invitacion/pendientes', {
      page: 1,
      size: MAX_REGISTROS,
    }).pipe(map((res) => res?.items ?? []));
  }

  /** Acepta la invitación: el usuario pasa a ser miembro de la empresa. */
  aceptar(invitacionId: number): Observable<unknown> {
    return this.post<unknown>(`/mas/invitacion/${invitacionId}/aceptar`, {});
  }

  /** Rechaza la invitación; no se puede deshacer. */
  rechazar(invitacionId: number): Observable<unknown> {
    return this.post<unknown>(`/mas/invitacion/${invitacionId}/rechazar`, {});
  }
}
