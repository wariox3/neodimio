import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { API_ENDPOINTS, BaseHttpService, PaginatedResponse } from '../../../core';
import {
  MembresiaClienteService,
  sinCliente,
} from '../../contenedores/services/membresia-cliente.service';
import { ArchivoVisita, Visita, VisitaDetalle } from '../models/visita.model';

/**
 * Visitas que se consultan, el máximo que acepta fluor por página. Un cliente rara vez
 * tiene tantas, y así la tabla pagina sin volver a pedir.
 */
export const MAX_VISITAS = 200;

/** Visitas del cliente y si quedaron algunas sin consultar. */
export interface VisitasResultado {
  items: Visita[];
  incompleto: boolean;
}

/** Visitas comerciales y de seguridad que la empresa le hizo al cliente de la membresía. */
@Injectable({ providedIn: 'root' })
export class VisitaService extends BaseHttpService {
  private readonly membresiaCliente = inject(MembresiaClienteService);

  listar(): Observable<VisitasResultado> {
    const clienteId = this.membresiaCliente.clienteId();
    // fluor exige `tercero_id` y solo devuelve las visitas de ese cliente.
    if (clienteId === null) return sinCliente();
    return this.get<PaginatedResponse<Visita>>(API_ENDPOINTS.visita.lista, {
      page: 1,
      size: MAX_VISITAS,
      tercero_id: clienteId,
    }).pipe(map((res) => ({ items: res.items, incompleto: res.total > res.items.length })));
  }

  /** Visita con sus compromisos y reportes. fluor responde 404 si no es del cliente. */
  detalle(id: number): Observable<VisitaDetalle> {
    const clienteId = this.membresiaCliente.clienteId();
    if (clienteId === null) return sinCliente();
    return this.get<VisitaDetalle>(API_ENDPOINTS.visita.detalle(id), { tercero_id: clienteId });
  }

  /** PDF del formato de la visita. */
  imprimir(id: number): Observable<Blob> {
    const clienteId = this.membresiaCliente.clienteId();
    if (clienteId === null) return sinCliente();
    return this.http.get(`${this.baseUrl}${API_ENDPOINTS.visita.imprimir(id)}`, {
      params: { tercero_id: clienteId },
      responseType: 'blob',
    });
  }

  /** Archivos que la empresa cargó a la visita. */
  archivos(id: number): Observable<ArchivoVisita[]> {
    const clienteId = this.membresiaCliente.clienteId();
    if (clienteId === null) return sinCliente();
    return this.get<ArchivoVisita[]>(API_ENDPOINTS.visita.archivos(id), { tercero_id: clienteId });
  }

  descargar(id: number, archivoId: number): Observable<Blob> {
    const clienteId = this.membresiaCliente.clienteId();
    if (clienteId === null) return sinCliente();
    return this.http.get(`${this.baseUrl}${API_ENDPOINTS.visita.descargar(id, archivoId)}`, {
      params: { tercero_id: clienteId },
      responseType: 'blob',
    });
  }
}
