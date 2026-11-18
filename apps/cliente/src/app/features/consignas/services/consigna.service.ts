import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { API_ENDPOINTS, BaseHttpService, PaginatedResponse } from '../../../core';
import {
  MembresiaClienteService,
  sinCliente,
} from '../../contenedores/services/membresia-cliente.service';
import { Consigna } from '../models/consigna.model';

/**
 * Consignas que se consultan, el máximo que acepta fluor por página. Alcanza para los puestos
 * de un cliente, y así la tabla filtra y pagina sin volver a pedir.
 */
export const MAX_CONSIGNAS = 200;

/** Consignas del cliente y si quedaron algunas sin consultar. */
export interface ConsignasResultado {
  items: Consigna[];
  incompleto: boolean;
}

/** Consignas de los puestos del cliente de la membresía y las generales. */
@Injectable({ providedIn: 'root' })
export class ConsignaService extends BaseHttpService {
  private readonly membresiaCliente = inject(MembresiaClienteService);

  listar(): Observable<ConsignasResultado> {
    const clienteId = this.membresiaCliente.clienteId();
    // fluor exige `tercero_id` y solo devuelve las consignas de los puestos de ese cliente.
    if (clienteId === null) return sinCliente();
    return this.get<PaginatedResponse<Consigna>>(API_ENDPOINTS.consigna.lista, {
      page: 1,
      size: MAX_CONSIGNAS,
      tercero_id: clienteId,
    }).pipe(map((res) => ({ items: res.items, incompleto: res.total > res.items.length })));
  }
}
