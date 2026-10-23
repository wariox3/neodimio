import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseHttpService, BaseQueryParams, PaginatedResponse } from '../../../core';
import { Pago } from '../models/pago.model';

@Injectable({ providedIn: 'root' })
export class PagosService extends BaseHttpService {
  private readonly PAGOS_URL = '/rhu/pago/lista';

  getPagos(params?: BaseQueryParams): Observable<PaginatedResponse<Pago>> {
    return this.get<PaginatedResponse<Pago>>('/rhu/pago/lista-portal', {
      page: params?.page,
      size: params?.size,
      empleado_id: params?.empleado_id,
    });
  }

  imprimirPago(pagoId: number): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/rhu/pago/${pagoId}/imprimir`, {
      responseType: 'blob',
    });
  }
}
