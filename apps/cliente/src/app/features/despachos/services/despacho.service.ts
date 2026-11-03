import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { aFechaApi, API_ENDPOINTS, BaseHttpService, PaginatedResponse } from '../../../core';
import { Despacho, DespachoDeGuia, DespachoListaParams } from '../models/despacho.model';

@Injectable({ providedIn: 'root' })
export class DespachoService extends BaseHttpService {
  listar(params: DespachoListaParams): Observable<PaginatedResponse<Despacho>> {
    return this.get<PaginatedResponse<Despacho>>(API_ENDPOINTS.despacho.lista, {
      page: params.page,
      size: params.size,
      numero: params.numero,
      codigo_vehiculo_fk: params.codigo_vehiculo_fk || null,
      // `fecha` del despacho es de tipo `date`: no necesita el ajuste del día siguiente.
      fecha_desde: params.fecha_desde ? aFechaApi(params.fecha_desde) : null,
      fecha_hasta: params.fecha_hasta ? aFechaApi(params.fecha_hasta) : null,
    });
  }

  deGuia(guiaId: number): Observable<DespachoDeGuia[]> {
    return this.get<DespachoDeGuia[]>(API_ENDPOINTS.despacho.deGuia(guiaId));
  }
}
