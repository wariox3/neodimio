import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { API_ENDPOINTS, BaseHttpService, PaginatedResponse } from '../../../core';
import {
  MembresiaClienteService,
  sinCliente,
} from '../../contenedores/services/membresia-cliente.service';
import { Pqrs } from '../models/pqrs.model';

/**
 * PQRS que se consultan, el máximo que acepta fluor por página. Un cliente rara vez tiene
 * tantas, y así la tabla pagina sin volver a pedir.
 */
export const MAX_PQRS = 200;

/** PQRS del cliente y si quedaron algunas sin consultar. */
export interface PqrsResultado {
  items: Pqrs[];
  incompleto: boolean;
}

/** Peticiones, quejas, reclamos y sugerencias del cliente de la membresía. */
@Injectable({ providedIn: 'root' })
export class PqrsService extends BaseHttpService {
  private readonly membresiaCliente = inject(MembresiaClienteService);

  listar(): Observable<PqrsResultado> {
    const clienteId = this.membresiaCliente.clienteId();
    // fluor exige `tercero_id` y solo devuelve las PQRS de ese cliente.
    if (clienteId === null) return sinCliente();
    return this.get<PaginatedResponse<Pqrs>>(API_ENDPOINTS.pqrs.lista, {
      page: 1,
      size: MAX_PQRS,
      tercero_id: clienteId,
    }).pipe(map((res) => ({ items: res.items, incompleto: res.total > res.items.length })));
  }
}
