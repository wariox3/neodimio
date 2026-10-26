import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { API_ENDPOINTS, BaseHttpService, PaginatedResponse } from '../../../core';
import { Contenedor } from '../models/contenedor.model';

/** Tope de empresas por usuario que se traen de una vez; la búsqueda es local. */
const MAX_CONTENEDORES = 200;

@Injectable({ providedIn: 'root' })
export class ContenedorService extends BaseHttpService {
  /** Empresas a las que pertenece el usuario autenticado. */
  getContenedores(): Observable<Contenedor[]> {
    return this.get<PaginatedResponse<Contenedor>>('/mas/user-tenant/lista', {
      page: 1,
      size: MAX_CONTENEDORES,
    }).pipe(map((res) => res?.items ?? []));
  }

  /**
   * Sale de la empresa borrando la membresía propia (`id` de `/mas/user-tenant/lista`).
   * Cualquier miembro puede borrar la suya.
   */
  salir(userTenantId: number): Observable<unknown> {
    return this.delete<unknown>(API_ENDPOINTS.userTenant.eliminar(userTenantId));
  }
}
