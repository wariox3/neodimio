import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { ENVIRONMENT, TENANT_EXCLUDED_PATHS } from '../tokens';
import { ActiveTenantService } from '../tenant/active-tenant.service';

/**
 * Agrega la cabecera `X-Tenant-ID` con la empresa activa a las peticiones
 * dirigidas al API, salvo a las rutas de `TENANT_EXCLUDED_PATHS` (autenticación
 * y datos maestros, que no dependen de la empresa). Sin empresa activa la
 * petición sale sin cabecera.
 */
export const tenantInterceptor: HttpInterceptorFn = (req, next) => {
  const { apiUrl } = inject(ENVIRONMENT);
  const tenantId = inject(ActiveTenantService).tenantId();

  if (!req.url.startsWith(apiUrl) || tenantId === null) return next(req);

  const path = req.url.slice(apiUrl.length);
  if (inject(TENANT_EXCLUDED_PATHS).some((prefix) => path.startsWith(prefix))) return next(req);

  return next(req.clone({ setHeaders: { 'X-Tenant-ID': String(tenantId) } }));
};
