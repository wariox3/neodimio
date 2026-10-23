import { Injectable, computed, inject } from '@angular/core';
import { Observable, switchMap } from 'rxjs';
import { ActiveTenantService, BaseAuthService, AuthApiEndpoints } from '@semantica/core';
import { PaginatedResponse } from '../../../core';
import { Tenant } from '../../dashboard/models/tenant.model';
import { Membresia } from '../../dashboard/models/membresia.model';
import { MembresiaService } from '../../dashboard/services/membresia.service';
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

  private readonly membresiaService = inject(MembresiaService);
  private readonly activeTenant = inject(ActiveTenantService);

  /** Hay una empresa elegida: los módulos trabajan sobre ella (`X-Tenant-ID`). */
  readonly hasTenant = computed(() => this.activeTenant.hasTenant());

  /** Membresía del usuario en la empresa elegida. */
  readonly membresiaActiva = computed(() => {
    const tenantId = this.activeTenant.tenantId();
    return this.membresiaService.membresias()?.find((m) => m.tenant_id === tenantId) ?? null;
  });

  /**
   * Empleado del usuario en la empresa elegida. Ya no viene en `/me`: cada
   * empresa tiene su propio empleado, guardado en la membresía.
   */
  readonly empleadoId = computed(() => this.membresiaActiva()?.empleado_id ?? null);

  /** Además de la sesión, olvida las empresas del usuario y la empresa elegida. */
  override clearSession(): void {
    this.membresiaService.limpiar();
    this.activeTenant.clear();
    super.clearSession();
  }

  /**
   * Asocia al usuario autenticado con una empresa (tenant). El backend toma el
   * usuario de la sesión y lo vincula si existe como empleado en esa empresa
   * (mismo documento y correo). Después recarga sus empresas, que es de donde
   * sale el `empleado_id`.
   */
  asociarEmpresa(tenantId: number): Observable<Membresia[]> {
    const body: AsociarEmpresaRequest = { tenant_id: tenantId };
    return this.http
      .post<void>(`${this.environment.apiUrl}${API_ENDPOINTS.userTenant.asociar}`, body)
      .pipe(switchMap(() => this.membresiaService.cargar()));
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
