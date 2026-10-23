import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { BaseHttpService, API_ENDPOINTS, PaginatedResponse } from '../../../core';
import { Tenant } from '../models/tenant.model';

@Injectable({ providedIn: 'root' })
export class TenantService extends BaseHttpService {
  /** Busca empresas/tenants por nombre (búsqueda server-side). */
  buscarTenants(nombre: string): Observable<Tenant[]> {
    return this.get<PaginatedResponse<Tenant>>(API_ENDPOINTS.tenant.buscar, { nombre }).pipe(
      map((res) => res?.items ?? []),
    );
  }
}
