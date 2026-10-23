import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { ENVIRONMENT } from '../tokens';
import { ActiveTenantService } from '../tenant/active-tenant.service';

/**
 * Agrega la cabecera `X-Tenant-ID` con la empresa activa a las peticiones
 * dirigidas al API. Sin empresa activa la petición sale sin cabecera.
 */
export const tenantInterceptor: HttpInterceptorFn = (req, next) => {
  const environment = inject(ENVIRONMENT);
  const tenantId = inject(ActiveTenantService).tenantId();

  if (!req.url.startsWith(environment.apiUrl) || tenantId === null) return next(req);

  return next(req.clone({ setHeaders: { 'X-Tenant-ID': String(tenantId) } }));
};
