import { Injectable, computed } from '@angular/core';
import { Observable, switchMap } from 'rxjs';
import { BaseAuthService, AuthApiEndpoints } from '@semantica/core';
import { PaginatedResponse } from '../../../core';
import { Tenant } from '../../dashboard/models/tenant.model';
import {
  AsociarEmpresaRequest,
  RegisterRequest,
  RegisterResponse,
  Usuario,
} from '../models/auth.model';
import { API_ENDPOINTS } from '../../../core/constants/api-endpoints.constants';
import { ROUTE_PATHS } from '../../../core/constants/route-paths.constants';

@Injectable({ providedIn: 'root' })
export class AuthService extends BaseAuthService<Usuario> {
  protected readonly apiEndpoints: AuthApiEndpoints = {
    login: API_ENDPOINTS.auth.login,
    logout: API_ENDPOINTS.auth.logout,
    refresh: API_ENDPOINTS.auth.refresh,
    me: API_ENDPOINTS.auth.me,
    forgotPassword: API_ENDPOINTS.auth.forgotPassword,
    resetPassword: API_ENDPOINTS.auth.resetPassword,
    resendVerification: API_ENDPOINTS.auth.resendVerification,
    verifyEmail: API_ENDPOINTS.auth.verifyEmail,
  };

  protected readonly loginRoute = ROUTE_PATHS.auth.login;

  readonly hasTenant = computed(() => !!this.currentUser()?.tenant_id);

  /**
   * Asocia al usuario autenticado con una empresa (tenant).
   * Tras la asociacion, refresca el usuario para obtener el empleado_id.
   */
  asociarEmpresa(tenantId: number): Observable<Usuario | null> {
    const userId = this.currentUser()?.id;

    if (!userId) {
      throw new Error('No se puede asociar empresa sin un usuario autenticado.');
    }

    const body: AsociarEmpresaRequest = { usuario_id: userId, tenant_id: tenantId };
    return this.http
      .post<void>(`${this.environment.apiUrl}${API_ENDPOINTS.auth.asociarEmpresa}`, body)
      .pipe(switchMap(() => this.me()));
  }

  /**
   * Registra un nuevo usuario en el sistema.
   */
  register(data: RegisterRequest): Observable<RegisterResponse> {
    return this.http.post<RegisterResponse>(
      `${this.environment.apiUrl}${API_ENDPOINTS.auth.register}`,
      data,
    );
  }

  buscarTenants(nombre: string): Observable<PaginatedResponse<Tenant>> {
    return this.http.get<PaginatedResponse<Tenant>>(
      `${this.environment.apiUrl}${API_ENDPOINTS.tenant.buscar}`,
      { params: { nombre } },
    );
  }
}
