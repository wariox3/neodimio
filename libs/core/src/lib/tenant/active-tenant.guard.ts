import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { TENANT_SELECTION_PATH } from '../tokens';
import { ActiveTenantService } from './active-tenant.service';

/**
 * Exige una empresa activa; si no la hay, redirige a la pantalla de
 * selección de empresas (`TENANT_SELECTION_PATH`).
 */
export const activeTenantGuard: CanActivateFn = () => {
  const activeTenant = inject(ActiveTenantService);
  const router = inject(Router);

  if (activeTenant.hasTenant()) return true;

  return router.createUrlTree([inject(TENANT_SELECTION_PATH)]);
};
