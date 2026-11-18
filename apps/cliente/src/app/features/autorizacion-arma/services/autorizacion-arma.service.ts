import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { API_ENDPOINTS, BaseHttpService, PaginatedResponse } from '../../../core';
import {
  MembresiaClienteService,
  sinCliente,
} from '../../contenedores/services/membresia-cliente.service';
import { AutorizacionArma } from '../models/autorizacion-arma.model';

/**
 * Empleados que se consultan, el máximo que acepta fluor por página. Alcanza para el
 * personal de un cliente, y así la tabla pagina sin volver a pedir.
 */
export const MAX_AUTORIZACIONES = 200;

/** Empleados del cliente y si quedaron algunos sin consultar. */
export interface AutorizacionesResultado {
  items: AutorizacionArma[];
  incompleto: boolean;
}

/** Autorizaciones para portar armas del personal que presta servicio al cliente. */
@Injectable({ providedIn: 'root' })
export class AutorizacionArmaService extends BaseHttpService {
  private readonly membresiaCliente = inject(MembresiaClienteService);

  listar(): Observable<AutorizacionesResultado> {
    const clienteId = this.membresiaCliente.clienteId();
    // fluor exige `tercero_id` y solo devuelve los empleados de ese cliente.
    if (clienteId === null) return sinCliente();
    return this.get<PaginatedResponse<AutorizacionArma>>(API_ENDPOINTS.autorizacionArma.lista, {
      page: 1,
      size: MAX_AUTORIZACIONES,
      tercero_id: clienteId,
    }).pipe(map((res) => ({ items: res.items, incompleto: res.total > res.items.length })));
  }

  /** PDF de la autorización de un empleado. */
  imprimir(empleadoId: number): Observable<Blob> {
    return this.pdf(API_ENDPOINTS.autorizacionArma.imprimir(empleadoId));
  }

  /** PDF con las autorizaciones de los empleados con las tres fechas vigentes. */
  imprimirVigentes(): Observable<Blob> {
    return this.pdf(API_ENDPOINTS.autorizacionArma.imprimirTodos);
  }

  private pdf(path: string): Observable<Blob> {
    const clienteId = this.membresiaCliente.clienteId();
    if (clienteId === null) return sinCliente();
    return this.http.get(`${this.baseUrl}${path}`, {
      params: { tercero_id: clienteId },
      responseType: 'blob',
    });
  }
}
