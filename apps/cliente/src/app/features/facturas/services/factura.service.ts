import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { aFechaApi, API_ENDPOINTS, BaseHttpService, PaginatedResponse } from '../../../core';
import {
  MembresiaClienteService,
  sinCliente,
} from '../../contenedores/services/membresia-cliente.service';
import { Factura, FacturaFiltros, facturasVisibles } from '../models/factura.model';

/**
 * Facturas que se consultan para armar la lista. Fluor no filtra por estado, así que
 * se piden las más recientes y se dejan las aprobadas.
 */
export const MAX_FACTURAS = 200;

/** Resultado de la lista: las facturas visibles y si quedaron facturas sin consultar. */
export interface FacturasResultado {
  items: Factura[];
  incompleto: boolean;
}

/** Facturas de venta del cliente de la membresía. */
@Injectable({ providedIn: 'root' })
export class FacturaService extends BaseHttpService {
  private readonly membresiaCliente = inject(MembresiaClienteService);

  listar(filtros: FacturaFiltros): Observable<FacturasResultado> {
    const clienteId = this.membresiaCliente.clienteId();
    // Sin `tercero_id` fluor devolvería las facturas de todos los clientes.
    if (clienteId === null) return sinCliente();
    return this.get<PaginatedResponse<Factura>>(API_ENDPOINTS.factura.lista, {
      page: 1,
      size: MAX_FACTURAS,
      tercero_id: clienteId,
      // `fecha` de la factura es `date`: no necesita el ajuste del día siguiente.
      fecha_desde: filtros.fecha_desde ? aFechaApi(filtros.fecha_desde) : null,
      fecha_hasta: filtros.fecha_hasta ? aFechaApi(filtros.fecha_hasta) : null,
    }).pipe(
      map((res) => ({
        items: facturasVisibles(res.items),
        incompleto: res.total > res.items.length,
      })),
    );
  }
}
