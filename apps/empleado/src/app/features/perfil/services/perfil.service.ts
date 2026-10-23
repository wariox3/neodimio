import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseHttpService } from '../../../core';
import { PerfilDetalle, UpdatePerfilRequest } from '../models/perfil.model';

@Injectable({ providedIn: 'root' })
export class PerfilService extends BaseHttpService {
  private readonly BASE = '/auth/user';

  getDetalle(): Observable<PerfilDetalle> {
    return this.get<PerfilDetalle>(`${this.BASE}/detalle`);
  }

  updatePerfil(data: UpdatePerfilRequest): Observable<void> {
    return this.put<void>(`${this.BASE}/actualizar`, data);
  }
}
