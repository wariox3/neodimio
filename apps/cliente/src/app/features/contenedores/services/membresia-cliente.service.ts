import { Injectable, signal } from '@angular/core';
import { Observable, throwError } from 'rxjs';

/**
 * Error para las consultas que exigen el cliente de la membresía. Varias listas de fluor
 * solo filtran por cliente si reciben su id: sin él devolverían los datos de todos.
 */
export function sinCliente(): Observable<never> {
  return throwError(() => new Error('El usuario no tiene un cliente asociado.'));
}

/**
 * Cliente (tercero) que representa el usuario en la empresa activa y el id de su membresía.
 *
 * Lo fija `membresiaClienteGuard` con la respuesta del API al entrar al dashboard, de
 * modo que nunca sale de `localStorage` y todas las pantallas lo encuentran disponible.
 */
@Injectable({ providedIn: 'root' })
export class MembresiaClienteService {
  private readonly _clienteId = signal<number | null>(null);
  private readonly _membresiaId = signal<number | null>(null);

  readonly clienteId = this._clienteId.asReadonly();
  readonly membresiaId = this._membresiaId.asReadonly();

  set(clienteId: number, membresiaId: number | null = null): void {
    this._clienteId.set(clienteId);
    this._membresiaId.set(membresiaId);
  }
}
