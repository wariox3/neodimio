import { Injectable, computed, signal } from '@angular/core';

/** Empresa con la que el usuario está trabajando. */
export interface ActiveTenant {
  id: number;
  nombre: string;
  /** El usuario es propietario de la empresa (`control` de su membresía). */
  propietario: boolean;
}

const STORAGE_KEY = 'semantica-active-tenant';

/**
 * Estado de la empresa (tenant) activa.
 *
 * Se elige en la pantalla de selección de empresas y se persiste en
 * `localStorage` para que una recarga no obligue a elegirla de nuevo.
 * El `tenantInterceptor` la lee para agregar la cabecera `X-Tenant-ID`.
 */
@Injectable({ providedIn: 'root' })
export class ActiveTenantService {
  private readonly _tenant = signal<ActiveTenant | null>(this.restore());

  readonly tenant = this._tenant.asReadonly();
  readonly tenantId = computed(() => this._tenant()?.id ?? null);
  readonly hasTenant = computed(() => this._tenant() !== null);
  readonly isPropietario = computed(() => this._tenant()?.propietario === true);

  set(tenant: ActiveTenant): void {
    this._tenant.set(tenant);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tenant));
    } catch {
      // Sin almacenamiento disponible la empresa solo vive en memoria.
    }
  }

  clear(): void {
    this._tenant.set(null);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Nada que limpiar.
    }
  }

  private restore(): ActiveTenant | null {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      const parsed: unknown = JSON.parse(raw);
      return isActiveTenant(parsed) ? parsed : null;
    } catch {
      return null;
    }
  }
}

function isActiveTenant(value: unknown): value is ActiveTenant {
  if (value === null || typeof value !== 'object') return false;
  const { id, nombre, propietario } = value as Record<string, unknown>;
  return typeof id === 'number' && typeof nombre === 'string' && typeof propietario === 'boolean';
}
