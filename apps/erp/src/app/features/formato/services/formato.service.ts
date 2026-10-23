import { Injectable, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { BaseHttpService, PaginatedResponse } from '../../../core';
import { Formato } from '../models/formato.model';
import { API_ENDPOINTS } from '../../../core';

@Injectable({ providedIn: 'root' })
export class FormatoService extends BaseHttpService {
  private readonly _formatos = signal<Formato[]>([]);
  private readonly _total = signal(0);

  readonly formatos = this._formatos.asReadonly();
  readonly total = this._total.asReadonly();

  getFormatos(page = 1, size = 50): Observable<PaginatedResponse<Formato>> {
    return this.get<PaginatedResponse<Formato>>(API_ENDPOINTS.formato.list, { page, size }).pipe(
      tap((res) => {
        this._formatos.set(res.items);
        this._total.set(res.total);
      }),
    );
  }

  getFormatoById(id: number): Observable<Formato> {
    return this.get<Formato>(API_ENDPOINTS.formato.byId(id));
  }

  updateContenido(id: number, contenido_externo: string | null): Observable<void> {
    return this.patch<void>(API_ENDPOINTS.formato.updateContenido(id), { contenido_externo });
  }
}
