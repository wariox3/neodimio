import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { API_ENDPOINTS, BaseHttpService, PaginatedResponse } from '../../../core';
import {
  MembresiaClienteService,
  sinCliente,
} from '../../contenedores/services/membresia-cliente.service';
import { ArchivoDocumental } from '../../../shared';
import { Pqrs, PqrsDetalle, PqrsNuevaRequest, PqrsTipo } from '../models/pqrs.model';

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

/**
 * Peticiones, quejas, reclamos y sugerencias del cliente de la membresía: las consulta y las
 * registra desde el portal, con su gestión y archivos.
 */
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

  /** Tipos de PQRS habilitados para el portal. */
  tipos(): Observable<PqrsTipo[]> {
    return this.get<PqrsTipo[]>(API_ENDPOINTS.pqrs.tipos);
  }

  /** Registra una PQRS; fluor la asigna al cliente de la membresía. */
  crear(req: PqrsNuevaRequest): Observable<Pqrs> {
    return this.post<Pqrs>(API_ENDPOINTS.pqrs.nuevo, req);
  }

  /** PQRS con su análisis, seguimientos y respuestas. fluor responde 404 si no es del cliente. */
  detalle(id: number): Observable<PqrsDetalle> {
    const clienteId = this.membresiaCliente.clienteId();
    if (clienteId === null) return sinCliente();
    return this.get<PqrsDetalle>(API_ENDPOINTS.pqrs.detalle(id), { tercero_id: clienteId });
  }

  /** Archivos que la empresa cargó a la PQRS y marcó para el portal. */
  archivos(id: number): Observable<ArchivoDocumental[]> {
    const clienteId = this.membresiaCliente.clienteId();
    if (clienteId === null) return sinCliente();
    return this.get<ArchivoDocumental[]>(API_ENDPOINTS.pqrs.archivos(id), {
      tercero_id: clienteId,
    });
  }

  descargar(id: number, archivoId: number): Observable<Blob> {
    const clienteId = this.membresiaCliente.clienteId();
    if (clienteId === null) return sinCliente();
    return this.http.get(`${this.baseUrl}${API_ENDPOINTS.pqrs.descargar(id, archivoId)}`, {
      params: { tercero_id: clienteId },
      responseType: 'blob',
    });
  }
}
