import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { API_ENDPOINTS, BaseHttpService, PaginatedResponse } from '../../../core';
import {
  MembresiaClienteService,
  sinCliente,
} from '../../contenedores/services/membresia-cliente.service';
import { Programacion, ordenarPorPuesto } from '../models/programacion.model';

/**
 * Programaciones que se consultan de un mes. Terbio muestra el mes completo, y para
 * agruparlas por puesto hay que tenerlas todas, así que se piden en una sola consulta.
 */
export const MAX_PROGRAMACIONES = 1000;

/** Programaciones del mes ordenadas por puesto, y si quedaron algunas sin consultar. */
export interface ProgramacionesResultado {
  items: Programacion[];
  incompleto: boolean;
}

/** Programación del personal que presta servicio al cliente de la membresía. */
@Injectable({ providedIn: 'root' })
export class ProgramacionService extends BaseHttpService {
  private readonly membresiaCliente = inject(MembresiaClienteService);

  delMes(anio: number, mes: number): Observable<ProgramacionesResultado> {
    const clienteId = this.membresiaCliente.clienteId();
    // Sin `tercero_id` fluor devolvería la programación de todos los clientes.
    if (clienteId === null) return sinCliente();
    return this.get<PaginatedResponse<Programacion>>(API_ENDPOINTS.programacion.lista, {
      page: 1,
      size: MAX_PROGRAMACIONES,
      tercero_id: clienteId,
      anio,
      mes,
    }).pipe(
      map((res) => ({
        items: ordenarPorPuesto(res.items),
        incompleto: res.total > res.items.length,
      })),
    );
  }
}
