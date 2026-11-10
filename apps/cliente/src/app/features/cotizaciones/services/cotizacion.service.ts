import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { API_ENDPOINTS, BaseHttpService, PaginatedResponse } from '../../../core';
import {
  MembresiaClienteService,
  sinCliente,
} from '../../contenedores/services/membresia-cliente.service';
import { Cotizacion } from '../models/cotizacion.model';

/**
 * Cotizaciones que se consultan, el máximo que acepta fluor por página. Un cliente rara vez
 * tiene tantas, y así la tabla pagina sin volver a pedir.
 */
export const MAX_COTIZACIONES = 200;

/** Cotizaciones del cliente y si quedaron algunas sin consultar. */
export interface CotizacionesResultado {
  items: Cotizacion[];
  incompleto: boolean;
}

/** Cotizaciones que la empresa le ha hecho al cliente de la membresía. */
@Injectable({ providedIn: 'root' })
export class CotizacionService extends BaseHttpService {
  private readonly membresiaCliente = inject(MembresiaClienteService);

  listar(): Observable<CotizacionesResultado> {
    const clienteId = this.membresiaCliente.clienteId();
    // fluor exige `tercero_id` y solo devuelve las cotizaciones de ese cliente.
    if (clienteId === null) return sinCliente();
    return this.get<PaginatedResponse<Cotizacion>>(API_ENDPOINTS.cotizacion.lista, {
      page: 1,
      size: MAX_COTIZACIONES,
      tercero_id: clienteId,
    }).pipe(map((res) => ({ items: res.items, incompleto: res.total > res.items.length })));
  }
}
