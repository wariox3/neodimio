import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../../features/auth/services/auth.service';
import { ROUTE_PATHS } from '../constants/route-paths.constants';

export const tenantGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (auth.hasTenant()) return true;

  return router.createUrlTree([ROUTE_PATHS.dashboard.inicio]);
};
