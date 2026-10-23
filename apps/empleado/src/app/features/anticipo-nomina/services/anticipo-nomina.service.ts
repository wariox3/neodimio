import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseHttpService, BaseQueryParams, PaginatedResponse } from '../../../core';
import { AnticipoNomina } from '../models/anticipo-nomina.model';

@Injectable({ providedIn: 'root' })
export class AnticipoNominaService extends BaseHttpService {
  getAnticipos(params?: BaseQueryParams): Observable<PaginatedResponse<AnticipoNomina>> {
    return this.get<PaginatedResponse<AnticipoNomina>>('/rhu/anticipo-nomina/lista-portal', {
      page: params?.page,
      size: params?.size,
      empleado_id: params?.empleado_id,
    });
  }
}
