import { Injectable, inject, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { BaseHttpService, API_ENDPOINTS } from '../../../core';
import { ApiKey, CreateApiKeyRequest, CreateApiKeyResponse } from '../models/api-key.model';
import { AuthService } from '../../auth/services/auth.service';

@Injectable({ providedIn: 'root' })
export class ApiKeyService extends BaseHttpService {
  private readonly authService = inject(AuthService);

  private readonly _apiKeys = signal<ApiKey[]>([]);
  readonly apiKeys = this._apiKeys.asReadonly();

  clearCache(): void {
    this._apiKeys.set([]);
  }

  getApiKeys(): Observable<ApiKey[]> {
    const tenantId = this.authService.currentUser()?.tenant_id;
    return this.get<ApiKey[]>(API_ENDPOINTS.apiKey.list, { tenant_id: tenantId }).pipe(
      tap((keys) => this._apiKeys.set(keys)),
    );
  }

  createApiKey(req: CreateApiKeyRequest): Observable<CreateApiKeyResponse> {
    return this.post<CreateApiKeyResponse>(API_ENDPOINTS.apiKey.create, req);
  }

  toggleApiKey(id: number, active: boolean): Observable<ApiKey> {
    return this.patch<ApiKey>(API_ENDPOINTS.apiKey.byId(id), { active }).pipe(
      tap((updated) =>
        this._apiKeys.update((keys) => keys.map((k) => (k.id === id ? updated : k))),
      ),
    );
  }

  deleteApiKey(id: number): Observable<void> {
    return this.delete<void>(API_ENDPOINTS.apiKey.byId(id)).pipe(
      tap(() => this._apiKeys.update((keys) => keys.filter((k) => k.id !== id))),
    );
  }
}
