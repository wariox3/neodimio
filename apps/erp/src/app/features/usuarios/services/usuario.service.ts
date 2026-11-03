import { Injectable, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { BaseHttpService, API_ENDPOINTS, PaginatedResponse } from '../../../core';
import {
  UsuarioTenantItem,
  UsuarioTenantConfiguracion,
  UsuarioTenantConfiguracionUpdateRequest,
  UsuarioTenantFilters,
  UsuarioTenantUpdateRequest,
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

  /** Actualiza los datos de la membresía del usuario. Solo para el propietario de la empresa. */
  updateUsuarioTenant(id: number, req: UsuarioTenantUpdateRequest): Observable<UsuarioTenantItem> {
    return this.patch<UsuarioTenantItem>(API_ENDPOINTS.userTenant.actualizar(id), req);
  }

  /** Configuración del usuario en la empresa; sus campos llegan en `null` si aún no tiene. */
  getConfiguracion(id: number): Observable<UsuarioTenantConfiguracion> {
    return this.get<UsuarioTenantConfiguracion>(API_ENDPOINTS.userTenantConfiguracion.detalle(id));
  }

  /** Actualiza la configuración del usuario. Solo para el propietario de la empresa. */
  updateConfiguracion(
    id: number,
    req: UsuarioTenantConfiguracionUpdateRequest,
  ): Observable<UsuarioTenantConfiguracion> {
    return this.patch<UsuarioTenantConfiguracion>(
      API_ENDPOINTS.userTenantConfiguracion.actualizar(id),
      req,
    );
  }

  /** Quita al usuario de la empresa borrando su membresía. Solo para el propietario de la empresa. */
  deleteUsuarioTenant(id: number): Observable<unknown> {
    return this.delete<unknown>(API_ENDPOINTS.userTenant.eliminar(id));
  }
}
