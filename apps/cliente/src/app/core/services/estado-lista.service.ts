import { Injectable, inject } from '@angular/core';
import { ActiveTenantService } from '@semantica/core';

/** Filtros aplicados y paginación de un listado. */
export interface EstadoLista<F> {
  filtros: F;
  first: number;
  rows: number;
}

const PREFIJO = 'semantica-estado-lista';

/** Formato exacto de `Date.toJSON()`: en `JSON.parse` estos textos vuelven a ser fechas. */
const FECHA_ISO = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;

function revivirFechas(_clave: string, valor: unknown): unknown {
  return typeof valor === 'string' && FECHA_ISO.test(valor) ? new Date(valor) : valor;
}

/**
 * Conserva el estado de los listados durante la sesión, para que al volver de un
 * detalle sigan como estaban. Va en `sessionStorage` (sobrevive a recargar, se pierde
 * al cerrar la pestaña) y separado por empresa, porque cada una tiene sus propios datos.
 */
@Injectable({ providedIn: 'root' })
export class EstadoListaService {
  private readonly activeTenant = inject(ActiveTenantService);

  guardar<F>(lista: string, estado: EstadoLista<F>): void {
    try {
      sessionStorage.setItem(this.clave(lista), JSON.stringify(estado));
    } catch {
      // Sin almacenamiento disponible el listado simplemente no se conserva.
    }
  }

  leer<F>(lista: string): EstadoLista<F> | null {
    try {
      const guardado = sessionStorage.getItem(this.clave(lista));
      return guardado ? (JSON.parse(guardado, revivirFechas) as EstadoLista<F>) : null;
    } catch {
      return null;
    }
  }

  /** Olvida los listados de todas las empresas (al cerrar sesión). */
  limpiar(): void {
    try {
      Object.keys(sessionStorage)
        .filter((clave) => clave.startsWith(`${PREFIJO}:`))
        .forEach((clave) => sessionStorage.removeItem(clave));
    } catch {
      // Nada que limpiar.
    }
  }

  private clave(lista: string): string {
    return `${PREFIJO}:${this.activeTenant.tenantId()}:${lista}`;
  }
}
