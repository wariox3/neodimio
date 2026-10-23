import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { ROUTE_PATHS } from '../tokens';
import { ActiveTenantService } from './active-tenant.service';

/**
 * Exige que el usuario sea propietario de la empresa activa; si no, vuelve al
 * dashboard. Va después de `activeTenantGuard`, que garantiza la empresa.
 */
export const propietarioGuard: CanActivateFn = () => {
  if (inject(ActiveTenantService).isPropietario()) return true;
  return inject(Router).createUrlTree([inject(ROUTE_PATHS).dashboard.root]);
};
