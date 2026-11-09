import { HttpErrorResponse, HttpEvent, HttpHandlerFn, HttpRequest } from '@angular/common/http';
import { catchError, Observable, switchMap, throwError } from 'rxjs';
import { AuthServiceContract } from '../tokens';
import { ToastService } from '../services/toast.service';
import { TokenRefreshService } from '../services/token-refresh.service';
import { parseApiError } from '../utils/error.utils';

function isAuthUrl(url: string, skipUrls: string[]): boolean {
  return skipUrls.some((endpoint) => url.includes(endpoint));
}

export function handleConnectionError(
  toast: ToastService,
  error: HttpErrorResponse,
): Observable<never> {
  toast.error('Error de conexion', 'No se pudo conectar con el servidor.');
  return throwError(() => error);
}

export function handleUnauthorized(
  req: HttpRequest<unknown>,
  next: HttpHandlerFn,
  authService: AuthServiceContract,
  tokenRefresh: TokenRefreshService,
  error: HttpErrorResponse,
  skipUrls: string[],
): Observable<HttpEvent<unknown>> {
  if (isAuthUrl(req.url, skipUrls)) {
    return throwError(() => error);
  }

  if (!tokenRefresh.refreshing) {
    tokenRefresh.startRefresh();

    // El `catchError` va antes del reintento: solo un refresh fallido cierra la sesión. Si el
    // reintento falla (un 4xx de negocio, un 500), la sesión ya se renovó y el error es de la
    // petición, no de la autenticación.
    return authService.refresh().pipe(
      catchError((refreshError) => {
        tokenRefresh.failRefresh();
        authService.clearSession();
        return throwError(() => refreshError);
      }),
      switchMap(() => {
        tokenRefresh.completeRefresh();
        return next(req);
      }),
    );
  }

  return tokenRefresh.waitForRefresh().pipe(
    switchMap((success) => {
      if (success) {
        return next(req);
      }
      return throwError(() => error);
    }),
  );
}

export function handleForbidden(toast: ToastService, error: HttpErrorResponse): Observable<never> {
  const apiError = parseApiError(error);

  if (apiError?.['is_verified'] === false) {
    return throwError(() => error);
  }

  const message = apiError?.message ?? 'No tienes permisos para realizar esta accion.';
  toast.error('Acceso denegado', message);
  return throwError(() => error);
}

export function handleTooManyRequests(
  toast: ToastService,
  error: HttpErrorResponse,
): Observable<never> {
  const apiError = parseApiError(error);
  const message =
    apiError?.message ?? 'Has excedido el limite de solicitudes. Intenta de nuevo mas tarde.';
  toast.warn('Demasiadas solicitudes', message);
  return throwError(() => error);
}

export function handleServerError(
  toast: ToastService,
  error: HttpErrorResponse,
): Observable<never> {
  const apiError = parseApiError(error);
  const message = apiError?.message ?? 'Ocurrio un error inesperado. Intenta de nuevo.';
  toast.error('Error del servidor', message);
  return throwError(() => error);
}
