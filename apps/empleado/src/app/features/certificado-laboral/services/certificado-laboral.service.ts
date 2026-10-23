import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseHttpService, BaseQueryParams, PaginatedResponse } from '../../../core';
import { Contrato } from '../models/contrato.model';

@Injectable({ providedIn: 'root' })
export class CertificadoLaboralService extends BaseHttpService {
  private readonly CONTRATOS_URL = '/rhu/contrato/lista';

  getContratos(params?: BaseQueryParams): Observable<PaginatedResponse<Contrato>> {
    return this.get<PaginatedResponse<Contrato>>(this.CONTRATOS_URL, {
      page: params?.page,
      size: params?.size,
      empleado_id: params?.empleado_id,
    });
  }

  imprimirCertificado(contratoId: number): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/rhu/contrato/imprimir-certificado-laboral`, {
      responseType: 'blob',
      params: { contrato_id: contratoId },
    });
  }
}
