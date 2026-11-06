import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { API_ENDPOINTS, BaseHttpService } from '../../../core';
import {
  MembresiaClienteService,
  sinCliente,
} from '../../contenedores/services/membresia-cliente.service';
import { InformacionCliente } from '../models/informacion.model';

/**
 * Información del cliente de la membresía. Se consulta en cada visita, sin el caché de
 * `CatalogoService`, para que muestre los datos de contacto vigentes.
 */
@Injectable({ providedIn: 'root' })
export class InformacionService extends BaseHttpService {
  private readonly membresiaCliente = inject(MembresiaClienteService);

  detalle(): Observable<InformacionCliente> {
    const clienteId = this.membresiaCliente.clienteId();
    if (clienteId === null) return sinCliente();
    return this.get<InformacionCliente>(API_ENDPOINTS.tercero.detalle(clienteId));
  }
}
