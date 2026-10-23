import { Injectable, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { BaseHttpService, API_ENDPOINTS, PaginatedResponse } from '../../../core';
import { UsuarioListItem, CreateUsuarioRequest } from '../models/usuario.model';

@Injectable({ providedIn: 'root' })
export class UsuarioService extends BaseHttpService {
  private readonly _usuarios = signal<UsuarioListItem[]>([]);
  private readonly _total = signal(0);

  readonly usuarios = this._usuarios.asReadonly();
  readonly total = this._total.asReadonly();

  clearCache(): void {
    this._usuarios.set([]);
    this._total.set(0);
  }

  getUsuarios(
    page = 1,
    size = 10,
    filters?: { role?: string | null; email?: string | null },
  ): Observable<PaginatedResponse<UsuarioListItem>> {
    return this.get<PaginatedResponse<UsuarioListItem>>(API_ENDPOINTS.user.list, {
      page,
      size,
      role: filters?.role || undefined,
      email: filters?.email || undefined,
    }).pipe(
      tap((res) => {
        this._usuarios.set(res.items);
        this._total.set(res.total);
      }),
    );
  }

  createUsuario(req: CreateUsuarioRequest): Observable<UsuarioListItem> {
    return this.post<UsuarioListItem>(API_ENDPOINTS.user.create, req);
  }
}
