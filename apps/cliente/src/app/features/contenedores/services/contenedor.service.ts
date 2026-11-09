import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { API_ENDPOINTS, BaseHttpService, PaginatedResponse } from '../../../core';
import { Contenedor } from '../models/contenedor.model';

/** Tope de empresas por usuario que se traen de una vez; la búsqueda es local. */
const MAX_CONTENEDORES = 200;

@Injectable({ providedIn: 'root' })
export class ContenedorService extends BaseHttpService {
  /**
   * Empresas en las que el usuario autenticado es cliente.
   *
   * `/mas/user-tenant/lista` aún ignora el parámetro `cliente`, por eso también se
   * filtra aquí con el dato que trae la respuesta.
   */
  getContenedores(): Observable<Contenedor[]> {
    return this.get<PaginatedResponse<Contenedor>>(API_ENDPOINTS.userTenant.lista, {
      page: 1,
      size: MAX_CONTENEDORES,
      cliente: true,
    }).pipe(map((res) => (res?.items ?? []).filter((contenedor) => contenedor.cliente)));
  }
}
