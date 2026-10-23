import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseHttpService, PaginatedResponse } from '../../../core';
import {
  ActualizarInformacionRequest,
  Ciudad,
  EmpleadoDetalle,
} from '../models/empleado-detalle.model';

@Injectable({ providedIn: 'root' })
export class ActualizarInformacionService extends BaseHttpService {
  private readonly EMPLEADO_DETALLE_URL = '/rhu/empleado/detalle';
  private readonly ACTUALIZACION_URL = '/rhu/empleado_actualizacion/nuevo';
  private readonly CIUDADES_URL = '/gen/ciudad/lista';

  getEmpleadoDetalle(empleadoId: number): Observable<EmpleadoDetalle> {
    return this.get<EmpleadoDetalle>(this.EMPLEADO_DETALLE_URL, {
      empleado_id: empleadoId,
    });
  }

  solicitarActualizacion(body: ActualizarInformacionRequest): Observable<unknown> {
    return this.post<unknown>(this.ACTUALIZACION_URL, body);
  }

  getCiudades(params?: { nombre?: string; ciudad_id?: number }): Observable<PaginatedResponse<Ciudad>> {
    return this.get<PaginatedResponse<Ciudad>>(this.CIUDADES_URL, {
      page: 1,
      size: 50,
      ...params,
    });
  }
}
