import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseHttpService, BaseQueryParams, PaginatedResponse } from '../../../core';
import {
  CreateReclamoRequest,
  Reclamo,
  ReclamoConcepto,
  ReclamoRespuesta,
} from '../models/reclamo.model';

@Injectable({ providedIn: 'root' })
export class ReclamosService extends BaseHttpService {
  private readonly RECLAMOS_URL = '/rhu/reclamo/lista';
  private readonly CONCEPTOS_URL = '/rhu/reclamo_concepto/lista';
  private readonly CREATE_URL = '/rhu/reclamo/nuevo';
  private readonly RESPUESTAS_URL = '/rhu/reclamo_respuesta/lista';

  getReclamos(params?: BaseQueryParams): Observable<PaginatedResponse<Reclamo>> {
    return this.get<PaginatedResponse<Reclamo>>(this.RECLAMOS_URL, {
      page: params?.page,
      size: params?.size,
      empleado_id: params?.empleado_id,
    });
  }

  getConceptos(): Observable<PaginatedResponse<ReclamoConcepto>> {
    return this.get<PaginatedResponse<ReclamoConcepto>>(this.CONCEPTOS_URL, { size: 200 });
  }

  createReclamo(body: CreateReclamoRequest): Observable<Reclamo> {
    return this.post<Reclamo>(this.CREATE_URL, body);
  }

  getRespuestas(reclamoId: number): Observable<PaginatedResponse<ReclamoRespuesta>> {
    return this.get<PaginatedResponse<ReclamoRespuesta>>(this.RESPUESTAS_URL, {
      reclamo_id: reclamoId,
      page: 1,
      size: 50,
    });
  }
}
