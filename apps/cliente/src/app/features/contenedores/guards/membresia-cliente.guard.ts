import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { catchError, map, of } from 'rxjs';
import { ActiveTenantService, ROUTE_PATHS } from '../../../core';
import { puedeIngresar } from '../models/contenedor.model';
import { ContenedorService } from '../services/contenedor.service';
import { MembresiaClienteService } from '../services/membresia-cliente.service';

/**
 * Revalida la membresía contra el API al entrar al dashboard. La empresa activa se
 * restaura de `localStorage`, así que puede venir de una sesión anterior a que le
 * retiraran el cliente. Si no se puede comprobar, vuelve a la selección de empresa.
 * También deja disponibles el `cliente_id` con el que se filtran las listas y el id de
 * la membresía con el que se consulta la configuración del usuario.
 */
export const membresiaClienteGuard: CanActivateFn = () => {
  const tenantId = inject(ActiveTenantService).tenantId();
  const seleccion = inject(Router).parseUrl(ROUTE_PATHS.contenedores.root);
  const membresiaCliente = inject(MembresiaClienteService);

  return inject(ContenedorService)
    .getContenedores()
    .pipe(
      map((contenedores) => {
        const membresia = contenedores.find((c) => c.tenant_id === tenantId);
        if (!membresia || !puedeIngresar(membresia)) return seleccion;
        membresiaCliente.set(membresia.cliente_id as number, membresia.id);
        return true;
      }),
      catchError(() => of(seleccion)),
    );
};
