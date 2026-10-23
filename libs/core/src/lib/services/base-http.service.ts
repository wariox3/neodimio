import { inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ENVIRONMENT } from '../tokens';

/** Tipo de valores aceptados para parámetros HTTP */
export type ParamValue = string | number | boolean | null | undefined;

/**
 * Construye un objeto HttpParams a partir de un record plano.
 * Los valores null/undefined son ignorados automáticamente.
 *
 * @example
 * buildHttpParams({ page: 1, size: 10, empleado_id: undefined })
 * // → HttpParams { page=1, size=10 }
 */
export function buildHttpParams(params: Record<string, ParamValue>): HttpParams {
  let httpParams = new HttpParams();
  for (const [key, value] of Object.entries(params)) {
    if (value != null) {
      httpParams = httpParams.set(key, String(value));
    }
  }
  return httpParams;
}

/**
 * Servicio base que provee utilidades HTTP comunes.
 *
 * Usa el token `ENVIRONMENT` para obtener la URL base, lo que permite
 * que tanto empleado como erp inyecten su propio entorno.
 *
 * @example
 * ```ts
 * @Injectable({ providedIn: 'root' })
 * export class PagosService extends BaseHttpService {
 *   getPagos(params?: BaseQueryParams): Observable<PaginatedResponse<Pago>> {
 *     return this.get<PaginatedResponse<Pago>>(API_ENDPOINTS.pagos.lista, { ... });
 *   }
 * }
 * ```
 */
export abstract class BaseHttpService {
  protected readonly http = inject(HttpClient);
  protected readonly baseUrl = inject(ENVIRONMENT).apiUrl;

  protected get<T>(path: string, params?: Record<string, ParamValue>): Observable<T> {
    return this.http.get<T>(`${this.baseUrl}${path}`, {
      params: buildHttpParams(params ?? {}),
    });
  }

  protected post<T>(path: string, body: unknown): Observable<T> {
    return this.http.post<T>(`${this.baseUrl}${path}`, body);
  }

  protected put<T>(path: string, body: unknown): Observable<T> {
    return this.http.put<T>(`${this.baseUrl}${path}`, body);
  }

  protected patch<T>(path: string, body: unknown): Observable<T> {
    return this.http.patch<T>(`${this.baseUrl}${path}`, body);
  }

  protected delete<T = void>(path: string): Observable<T> {
    return this.http.delete<T>(`${this.baseUrl}${path}`);
  }
}
