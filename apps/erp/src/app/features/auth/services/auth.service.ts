import { Injectable } from '@angular/core';
import { catchError, of } from 'rxjs';
import { BaseAuthService, AuthApiEndpoints } from '@semantica/core';
import { Usuario } from '../models/auth.model';
import { API_ENDPOINTS, ROUTE_PATHS } from '../../../core';

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

  /**
   * Cierra la sesion del usuario.
   * A diferencia del base, hace el HTTP call primero y limpia la sesion al completar.
   */
  override logout(): void {
    this.http
      .post(`${this.environment.apiUrl}${this.apiEndpoints.logout}`, {})
      .pipe(catchError(() => of(null)))
      .subscribe({ complete: () => this.clearSession() });
  }

  /**
   * Limpia la sesion sin hacer HTTP call.
   * Usado por el interceptor de errores cuando la sesion ya expiro (401).
   */
  forceLogout(): void {
    this.clearSession();
  }
}
