import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import {
  aFechaApi,
  aFechaHastaApi,
  API_ENDPOINTS,
  BaseHttpService,
  PaginatedResponse,
} from '../../../core';
import {
  MembresiaClienteService,
  sinCliente,
} from '../../contenedores/services/membresia-cliente.service';
import {
  CuentaPendiente,
  MovimientoCartera,
  PendienteListaParams,
  ReciboFiltros,
  recibosVigentes,
} from '../models/cartera.model';

/**
 * Movimientos que se consultan para armar la lista de recibos. Fluor no filtra por
 * estado, así que se piden los más recientes y se dejan los vigentes.
 */
export const MAX_MOVIMIENTOS = 200;

/** Resultado de los recibos: los vigentes y si quedaron movimientos sin consultar. */
export interface RecibosResultado {
  items: MovimientoCartera[];
  incompleto: boolean;
}

/**
 * Cartera del cliente de la membresía. Fluor solo filtra por cliente si recibe
 * `tercero_id`; sin él devolvería la cartera de todos, así que no se consulta.
 */
@Injectable({ providedIn: 'root' })
export class CarteraService extends BaseHttpService {
  private readonly membresiaCliente = inject(MembresiaClienteService);

  pendientes(params: PendienteListaParams): Observable<PaginatedResponse<CuentaPendiente>> {
    const clienteId = this.membresiaCliente.clienteId();
    if (clienteId === null) return sinCliente();
    return this.get<PaginatedResponse<CuentaPendiente>>(API_ENDPOINTS.cartera.pendientes, {
      page: params.page,
      size: params.size,
      tercero_id: clienteId,
      numero_documento: params.numero_documento || null,
      vencidas: params.vencidas || null,
      fecha_desde: params.fecha_desde ? aFechaApi(params.fecha_desde) : null,
      // `fecha` de la cuenta es `datetime`: se envía el día siguiente para incluir el último.
      fecha_hasta: params.fecha_hasta ? aFechaHastaApi(params.fecha_hasta) : null,
    });
  }

  recibos(filtros: ReciboFiltros): Observable<RecibosResultado> {
    const clienteId = this.membresiaCliente.clienteId();
    if (clienteId === null) return sinCliente();
    return this.get<PaginatedResponse<MovimientoCartera>>(API_ENDPOINTS.cartera.movimientos, {
      page: 1,
      size: MAX_MOVIMIENTOS,
      tercero_id: clienteId,
      fecha_desde: filtros.fecha_desde ? aFechaApi(filtros.fecha_desde) : null,
      fecha_hasta: filtros.fecha_hasta ? aFechaApi(filtros.fecha_hasta) : null,
    }).pipe(
      map((res) => ({
        items: recibosVigentes(res.items),
        incompleto: res.total > res.items.length,
      })),
    );
  }
}
