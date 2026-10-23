import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseHttpService, BaseQueryParams, PaginatedResponse } from '../../../core';
import { Capacitacion, CapacitacionDetalle } from '../models/capacitacion.model';

@Injectable({ providedIn: 'root' })
export class CapacitacionesService extends BaseHttpService {
  getCapacitaciones(params?: BaseQueryParams): Observable<PaginatedResponse<Capacitacion>> {
    return this.get<PaginatedResponse<Capacitacion>>('/rhu/capacitacion/lista-portal', {
      page: params?.page,
      size: params?.size,
      empleado_id: params?.empleado_id,
    });
  }

  getCapacitacionDetalles(params?: BaseQueryParams): Observable<PaginatedResponse<CapacitacionDetalle>> {
    return this.get<PaginatedResponse<CapacitacionDetalle>>('/rhu/capacitacion_detalle/lista-portal', {
      empleado_id: params?.empleado_id,
      page: params?.page,
      size: params?.size,
    });
  }

  confirmarAsistencia(pk: number): Observable<void> {
    return this.post<void>(`/rhu/capacitacion_detalle/confirmar-asistencia/${pk}`, {});
  }
}
