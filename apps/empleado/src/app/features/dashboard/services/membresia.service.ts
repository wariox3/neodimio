import { Injectable, computed, signal } from '@angular/core';
import { Observable, finalize, map, of, shareReplay, tap } from 'rxjs';
import { BaseHttpService, PaginatedResponse } from '../../../core';
import { Membresia } from '../models/membresia.model';

/**
 * Empresas a las que pertenece el usuario autenticado.
 *
 * Se consultan a `/mas/user-tenant/lista` una vez por sesión: de ahí sale si
 * el usuario tiene o no empresa asociada.
 */
@Injectable({ providedIn: 'root' })
export class MembresiaService extends BaseHttpService {
  /** `null` mientras no se han consultado. */
  private readonly _membresias = signal<Membresia[] | null>(null);
  /** Consulta en curso, compartida para no repetirla si se pide dos veces. */
  private enCurso$: Observable<Membresia[]> | null = null;

  readonly membresias = this._membresias.asReadonly();
  readonly cargadas = computed(() => this._membresias() !== null);
  readonly tieneEmpresa = computed(() => (this._membresias()?.length ?? 0) > 0);

  /**
   * Consulta las membresías, aunque ya estén cargadas. Con `empleado=true` el
   * backend solo devuelve las empresas donde el usuario tiene empleado
   * asignado: sin empleado, el portal no tiene nada que mostrarle ahí.
   */
  cargar(): Observable<Membresia[]> {
    this.enCurso$ ??= this.get<PaginatedResponse<Membresia>>('/mas/user-tenant/lista', {
      empleado: true,
    }).pipe(
      map((res) => res?.items ?? []),
      tap((membresias) => this._membresias.set(membresias)),
      finalize(() => (this.enCurso$ = null)),
      shareReplay(1),
    );
    return this.enCurso$;
  }

  /** Devuelve las membresías ya cargadas o las consulta si aún no se han pedido. */
  asegurar(): Observable<Membresia[]> {
    const actuales = this._membresias();
    return actuales ? of(actuales) : this.cargar();
  }

  /** Olvida las membresías (al cerrar la sesión). */
  limpiar(): void {
    this._membresias.set(null);
    this.enCurso$ = null;
  }
}
