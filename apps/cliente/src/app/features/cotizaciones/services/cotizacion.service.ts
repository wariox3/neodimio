import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { API_ENDPOINTS, BaseHttpService, PaginatedResponse } from '../../../core';
import {
  MembresiaClienteService,
  sinCliente,
} from '../../contenedores/services/membresia-cliente.service';
import {
  Cotizacion,
  CotizacionDetalle,
  CotizacionNuevaRequest,
  CotizacionServicio,
  CotizacionTipo,
  ServicioNuevoRequest,
} from '../models/cotizacion.model';

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

/**
 * Cotizaciones del cliente de la membresía: las que le hizo la empresa y las que él solicita
 * desde el portal, con sus servicios. Al crear o modificar, fluor toma el cliente de la
 * membresía y el ítem de la configuración del usuario.
 */
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

  /** Tipos de cotización de vigilancia habilitados para el portal. */
  tipos(): Observable<CotizacionTipo[]> {
    return this.get<CotizacionTipo[]>(API_ENDPOINTS.cotizacion.tipos);
  }

  crear(req: CotizacionNuevaRequest): Observable<CotizacionDetalle> {
    return this.post<CotizacionDetalle>(API_ENDPOINTS.cotizacion.nuevo, req);
  }

  /** Encabezado de la cotización. fluor responde 404 si no es del cliente. */
  detalle(id: number): Observable<CotizacionDetalle> {
    const clienteId = this.membresiaCliente.clienteId();
    if (clienteId === null) return sinCliente();
    return this.get<CotizacionDetalle>(API_ENDPOINTS.cotizacion.detalle(id), {
      tercero_id: clienteId,
    });
  }

  /** Servicios cotizados, en el orden en que se agregaron. */
  servicios(id: number): Observable<CotizacionServicio[]> {
    const clienteId = this.membresiaCliente.clienteId();
    if (clienteId === null) return sinCliente();
    return this.get<CotizacionServicio[]>(API_ENDPOINTS.cotizacion.servicios(id), {
      tercero_id: clienteId,
    });
  }

  /** Agrega un servicio; fluor reliquida la cotización. */
  agregarServicio(id: number, req: ServicioNuevoRequest): Observable<CotizacionServicio> {
    return this.post<CotizacionServicio>(API_ENDPOINTS.cotizacion.servicioNuevo(id), req);
  }

  /** Quita servicios de la cotización; fluor la reliquida. */
  eliminarServicios(id: number, ids: number[]): Observable<void> {
    return this.post<void>(API_ENDPOINTS.cotizacion.serviciosEliminar(id), { ids });
  }
}
