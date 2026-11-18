import { computed, inject, signal } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, catchError, of, tap } from 'rxjs';
import {
  AuthResponse,
  BaseUsuario,
  LoginRequest,
  ResendVerificationRequest,
} from '../models/auth.model';
import { ENVIRONMENT } from '../tokens';
import { TokenRefreshService } from '../services/token-refresh.service';

export interface AuthApiEndpoints {
  login: string;
  logout: string;
  refresh: string;
  me: string;
  forgotPassword: string;
  resetPassword: string;
  resendVerification: string;
  verifyEmail: string;
}

/**
 * Servicio base abstracto de autenticacion.
 *
 * Implementa la logica compartida (~70%) entre las apps del monorepo:
 * login, me, refresh, logout, forgotPassword, resetPassword,
 * resendVerification, verifyEmail, clearSession.
 *
 * Cada app extiende esta clase, define `apiEndpoints`, `loginRoute`,
 * y su tipo de usuario concreto.
 *
 * @example
 * ```ts
 * @Injectable({ providedIn: 'root' })
 * export class AuthService extends BaseAuthService<Usuario> {
 *   protected readonly apiEndpoints = { ... };
 *   protected readonly loginRoute = '/auth/login';
 * }
 * ```
 */
export abstract class BaseAuthService<TUser extends BaseUsuario> {
  protected readonly http = inject(HttpClient);
  protected readonly router = inject(Router);
  protected readonly tokenRefresh = inject(TokenRefreshService);
  protected readonly environment = inject(ENVIRONMENT);

  /** Endpoints de la API de autenticacion */
  protected abstract readonly apiEndpoints: AuthApiEndpoints;

  /** Ruta de login de la app (e.g. '/auth/login') */
  protected abstract readonly loginRoute: string;

  private readonly _currentUser = signal<TUser | null>(null);
  readonly currentUser = this._currentUser.asReadonly();
  readonly isAuthenticated = computed(() => !!this._currentUser());

  /**
   * Realiza el login del usuario.
   * El backend devuelve las cookies HTTP-only automaticamente.
   */
  login(credentials: LoginRequest): Observable<AuthResponse<TUser>> {
    return this.http
      .post<
        AuthResponse<TUser>
      >(`${this.environment.apiUrl}${this.apiEndpoints.login}`, credentials)
      .pipe(
        tap((response) => {
          this._currentUser.set(response.user);
        }),
      );
  }

  /**
   * Obtiene el usuario autenticado usando la cookie HTTP-only vigente.
   *
   * `null` significa una sola cosa: no hay sesion (401). Cualquier otro error se relanza, porque
   * una caida momentanea de red o un 500 no deben cerrarle la sesion a nadie.
   */
  me(): Observable<TUser | null> {
    return this.http.get<TUser>(`${this.environment.apiUrl}${this.apiEndpoints.me}`).pipe(
      tap((user) => {
        this._currentUser.set(user);
      }),
      catchError((error: unknown) => {
        if (error instanceof HttpErrorResponse && error.status === 401) {
          this._currentUser.set(null);
          return of(null);
        }
        throw error;
      }),
    );
  }

  /**
   * Renueva las cookies HTTP-only llamando al endpoint de refresh.
   */
  refresh(): Observable<void> {
    return this.http.post<void>(`${this.environment.apiUrl}${this.apiEndpoints.refresh}`, {});
  }

  /**
   * Cierra la sesion del usuario. Limpia la sesion local primero
   * y notifica al backend como best-effort.
   * Puede ser sobrescrito por las apps si necesitan logica adicional.
   */
  logout(): void {
    this.clearSession();
    this.http
      .post(`${this.environment.apiUrl}${this.apiEndpoints.logout}`, {})
      .pipe(catchError(() => of(null)))
      .subscribe();
  }

  /**
   * Envia un correo de recuperacion de contrasena al email indicado.
   */
  forgotPassword(email: string, captchaToken?: string): Observable<void> {
    return this.http.post<void>(`${this.environment.apiUrl}${this.apiEndpoints.forgotPassword}`, {
      email,
      ...(captchaToken && { turnstile_token: captchaToken }),
    });
  }

  /**
   * Establece una nueva contrasena usando el token de recuperacion.
   */
  resetPassword(token: string, password: string, captchaToken?: string): Observable<void> {
    return this.http.post<void>(`${this.environment.apiUrl}${this.apiEndpoints.resetPassword}`, {
      token,
      nueva_clave: password,
      ...(captchaToken && { turnstile_token: captchaToken }),
    });
  }

  /**
   * Reenvia el correo de verificacion de cuenta.
   */
  resendVerification(data: ResendVerificationRequest): Observable<void> {
    return this.http.post<void>(
      `${this.environment.apiUrl}${this.apiEndpoints.resendVerification}`,
      data,
    );
  }

  /**
   * Verifica la cuenta del usuario usando el token enviado por correo.
   */
  verifyEmail(token: string): Observable<void> {
    const params = new HttpParams().set('token', token);
    return this.http.get<void>(`${this.environment.apiUrl}${this.apiEndpoints.verifyEmail}`, {
      params,
    });
  }

  /**
   * Limpia la sesion local y redirige a login si habia una sesion abierta; un visitante sin
   * sesion en una pagina publica se queda donde esta.
   * Expuesto publicamente para uso en el error interceptor.
   */
  clearSession(): void {
    const hadSession = !!this._currentUser();
    this._currentUser.set(null);
    this.tokenRefresh.reset();
    if (hadSession) {
      this.router.navigate([this.loginRoute]);
    }
  }
}
