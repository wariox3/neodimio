import { Injectable, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { BaseHttpService, API_ENDPOINTS, PaginatedResponse } from '../../../core';
import {
  UsuarioListItem,
  UsuarioTenantItem,
  UsuarioTenantFilters,
  UsuarioTenantUpdateRequest,
  CreateUsuarioRequest,
} from '../models/usuario.model';

@Injectable({ providedIn: 'root' })
export class UsuarioService extends BaseHttpService {
  private readonly _usuarios = signal<UsuarioTenantItem[]>([]);
  private readonly _total = signal(0);

  readonly usuarios = this._usuarios.asReadonly();
  readonly total = this._total.asReadonly();

  clearCache(): void {
    this._usuarios.set([]);
    this._total.set(0);
  }

  /** Usuarios de la empresa. Solo para su propietario (`control`). */
  getUsuarios(
    tenantId: number,
    page = 1,
    size = 10,
    filters?: UsuarioTenantFilters,
  ): Observable<PaginatedResponse<UsuarioTenantItem>> {
    return this.get<PaginatedResponse<UsuarioTenantItem>>(API_ENDPOINTS.userTenant.listaTenant, {
      tenant_id: tenantId,
      page,
      size,
      erp: filters?.erp,
      control: filters?.control,
      user_email: filters?.email || undefined,
      codigo_usuario_fk: filters?.codigoUsuario || undefined,
    }).pipe(
      tap((res) => {
        this._usuarios.set(res.items);
        this._total.set(res.total);
      }),
    );
  }

  /** Actualiza el código del usuario en Semantica. Solo para el propietario de la empresa. */
  updateUsuarioTenant(id: number, req: UsuarioTenantUpdateRequest): Observable<UsuarioTenantItem> {
    return this.patch<UsuarioTenantItem>(API_ENDPOINTS.userTenant.actualizar(id), req);
  }

  createUsuario(req: CreateUsuarioRequest): Observable<UsuarioListItem> {
    return this.post<UsuarioListItem>(API_ENDPOINTS.user.create, req);
  }
}
