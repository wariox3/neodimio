import { Injectable, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { BaseHttpService } from '../../../core';

/** Datos personales del usuario, tal como los devuelve `/auth/user/detalle`. */
export interface Perfil {
  nombres: string | null;
  apellidos: string | null;
  email: string | null;
}

/**
 * Perfil del usuario autenticado. `/auth/seguridad/me` no trae el nombre,
 * así que se pide aparte y se guarda por usuario para no repetir la consulta.
 */
@Injectable({ providedIn: 'root' })
export class PerfilService extends BaseHttpService {
  private readonly _perfil = signal<{ usuarioId: number; perfil: Perfil } | null>(null);

  /** Perfil cargado y el usuario al que pertenece. */
  readonly cache = this._perfil.asReadonly();

  cargar(usuarioId: number): Observable<Perfil> {
    return this.get<Perfil>('/auth/user/detalle').pipe(
      tap((perfil) => this._perfil.set({ usuarioId, perfil })),
    );
  }
}
