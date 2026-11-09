import { Injectable, inject } from '@angular/core';
import { ActiveTenantService, BaseAuthService, AuthApiEndpoints } from '@semantica/core';
import { Usuario } from '../models/auth.model';
import { API_ENDPOINTS, EstadoListaService, ROUTE_PATHS } from '../../../core';
import { CatalogoService } from '../../catalogos/services/catalogo.service';

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

  private readonly activeTenant = inject(ActiveTenantService);
  private readonly estadoLista = inject(EstadoListaService);
  private readonly catalogo = inject(CatalogoService);

  /** Además de la sesión, olvida la empresa elegida, los filtros y los datos en caché. */
  override clearSession(): void {
    this.estadoLista.limpiar();
    this.catalogo.limpiar();
    this.activeTenant.clear();
    super.clearSession();
  }
}
