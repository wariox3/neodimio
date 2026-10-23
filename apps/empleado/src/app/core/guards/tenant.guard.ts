import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { catchError, map, of } from 'rxjs';
import { ActiveTenantService } from '@semantica/core';
import { MembresiaService } from '../../features/dashboard/services/membresia.service';
import { ROUTE_PATHS } from '../constants/route-paths.constants';

/**
 * Deja pasar solo con una empresa elegida que siga entre las del usuario.
 * Espera a que se consulten sus membresías: al entrar directo a un módulo aún
 * no están cargadas. Sin empresa vuelve al inicio, donde se elige o se asocia.
 */
export const tenantGuard: CanActivateFn = () => {
  const membresiaService = inject(MembresiaService);
  const activeTenantId = inject(ActiveTenantService).tenantId;
  const inicio = inject(Router).createUrlTree([ROUTE_PATHS.dashboard.inicio]);

  return membresiaService.asegurar().pipe(
    map((membresias) => {
      const elegida = membresias.find((m) => m.tenant_id === activeTenantId());
      return elegida?.activo ? true : inicio;
    }),
    catchError(() => of(inicio)),
  );
};
