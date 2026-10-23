import { inject } from '@angular/core';
import { CanActivateFn } from '@angular/router';
import { ActiveTenantService } from './active-tenant.service';

/**
 * Suelta la empresa activa al entrar a la selección de empresas: estar ahí es
 * no tener empresa elegida, así que nada debe seguir mostrándola ni enviando
 * su `X-Tenant-ID`.
 */
export const clearActiveTenantGuard: CanActivateFn = () => {
  inject(ActiveTenantService).clear();
  return true;
};
