import { Injectable, inject } from '@angular/core';
import { EMPTY, Observable, expand, map, reduce } from 'rxjs';
import { API_ENDPOINTS, BaseHttpService, PaginatedResponse } from '../../../core';
import { MembresiaClienteService } from '../../contenedores/services/membresia-cliente.service';
import {
  Destinatario,
  DestinatarioListaParams,
  DestinatarioNuevo,
} from '../models/destinatario.model';

/** Máximo de `size` que admite `/tte/destinatario/lista`. */
const TAMANO_MAXIMO = 200;

@Injectable({ providedIn: 'root' })
export class DestinatarioService extends BaseHttpService {
  private readonly membresiaCliente = inject(MembresiaClienteService);

  listar(params: DestinatarioListaParams): Observable<PaginatedResponse<Destinatario>> {
    return this.get<PaginatedResponse<Destinatario>>(API_ENDPOINTS.destinatario.lista, {
      page: params.page,
      size: params.size,
      codigo_tercero_fk: this.membresiaCliente.clienteId(),
      codigo_destinatario_pk: params.codigo_destinatario_pk ?? null,
      nombre_corto: params.nombre_corto || null,
      numero_identificacion: params.numero_identificacion || null,
    });
  }

  /** Todos los registros del filtro, recorriendo las páginas (para exportar). */
  listarTodos(params: Omit<DestinatarioListaParams, 'page' | 'size'>): Observable<Destinatario[]> {
    const pagina = (page: number) => this.listar({ ...params, page, size: TAMANO_MAXIMO });
    return pagina(1).pipe(
      expand((res) => (res.page * res.size < res.total ? pagina(res.page + 1) : EMPTY)),
      map((res) => res.items),
      reduce((todos, items) => [...todos, ...items], [] as Destinatario[]),
    );
  }

  obtener(id: number): Observable<Destinatario> {
    return this.get<Destinatario>(API_ENDPOINTS.destinatario.detalle(id));
  }

  /** Crea el destinatario asociado al cliente del usuario, para que solo lo vea ese cliente. */
  crear(destinatario: DestinatarioNuevo): Observable<Destinatario> {
    return this.post<Destinatario>(API_ENDPOINTS.destinatario.nuevo, {
      ...destinatario,
      codigo_tercero_fk: this.membresiaCliente.clienteId(),
    });
  }
}
