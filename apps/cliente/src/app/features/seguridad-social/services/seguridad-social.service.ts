import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { API_ENDPOINTS, BaseHttpService, PaginatedResponse } from '../../../core';
import {
  MembresiaClienteService,
  sinCliente,
} from '../../contenedores/services/membresia-cliente.service';
import { ArchivoSeguridadSocial, SeguridadSocial } from '../models/seguridad-social.model';

/**
 * Empleados que se consultan de un mes, el máximo que acepta fluor por página.
 * Una planilla de un cliente rara vez llega a tanto, y así la tabla pagina sin volver a pedir.
 */
export const MAX_SEGURIDAD_SOCIAL = 200;

/** Empleados del mes y si quedaron algunos sin consultar. */
export interface SeguridadSocialResultado {
  items: SeguridadSocial[];
  incompleto: boolean;
}

/**
 * Seguridad social (planilla PILA) de los empleados que prestan servicio al cliente de la
 * membresía, con los soportes que la empresa carga por empleado.
 */
@Injectable({ providedIn: 'root' })
export class SeguridadSocialService extends BaseHttpService {
  private readonly membresiaCliente = inject(MembresiaClienteService);

  delMes(anio: number, mes: number): Observable<SeguridadSocialResultado> {
    const clienteId = this.membresiaCliente.clienteId();
    // fluor exige `tercero_id`, y con él valida que cada empleado sea del cliente.
    if (clienteId === null) return sinCliente();
    return this.get<PaginatedResponse<SeguridadSocial>>(API_ENDPOINTS.seguridadSocial.lista, {
      page: 1,
      size: MAX_SEGURIDAD_SOCIAL,
      tercero_id: clienteId,
      anio,
      mes,
    }).pipe(map((res) => ({ items: res.items, incompleto: res.total > res.items.length })));
  }

  archivos(aporteContratoId: number): Observable<ArchivoSeguridadSocial[]> {
    const clienteId = this.membresiaCliente.clienteId();
    if (clienteId === null) return sinCliente();
    return this.get<ArchivoSeguridadSocial[]>(
      API_ENDPOINTS.seguridadSocial.archivos(aporteContratoId),
      { tercero_id: clienteId },
    );
  }

  descargar(aporteContratoId: number, archivoId: number): Observable<Blob> {
    const clienteId = this.membresiaCliente.clienteId();
    if (clienteId === null) return sinCliente();
    return this.http.get(
      `${this.baseUrl}${API_ENDPOINTS.seguridadSocial.descargar(aporteContratoId, archivoId)}`,
      { params: { tercero_id: clienteId }, responseType: 'blob' },
    );
  }
}
