import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { API_ENDPOINTS, BaseHttpService, PaginatedResponse } from '../../../core';
import { UsuarioListItem } from '../../usuarios/models/usuario.model';
import { ContenedorMiembro, InvitacionRequest } from '../models/contenedor.model';

/** Sugerencias que muestra el buscador de usuarios a invitar. */
const MAX_SUGERENCIAS = 10;

/** Tope de miembros por empresa que se traen de una vez. */
const MAX_MIEMBROS = 200;

@Injectable({ providedIn: 'root' })
export class InvitacionService extends BaseHttpService {
  /**
   * Usuarios verificados cuyo correo coincide con el término. El backend solo
   * invita usuarios verificados, así que los demás no se ofrecen.
   *
   * Usa `/auth/user/lista`, que exige rol `admin`.
   */
  buscarUsuarios(email: string): Observable<UsuarioListItem[]> {
    return this.get<PaginatedResponse<UsuarioListItem>>(API_ENDPOINTS.user.list, {
      page: 1,
      size: MAX_SUGERENCIAS,
      email,
      is_verified: true,
    }).pipe(map((res) => res?.items ?? []));
  }

  /** Miembros de la empresa. Solo para su propietario (`control`). */
  getMiembros(tenantId: number): Observable<ContenedorMiembro[]> {
    return this.get<PaginatedResponse<ContenedorMiembro>>('/mas/user-tenant/lista-tenant', {
      tenant_id: tenantId,
      page: 1,
      size: MAX_MIEMBROS,
    }).pipe(map((res) => res?.items ?? []));
  }

  /** Envía una invitación. Solo puede hacerlo el propietario de la empresa. */
  invitar(payload: InvitacionRequest): Observable<unknown> {
    return this.post<unknown>('/mas/invitacion/nuevo', payload);
  }
}
