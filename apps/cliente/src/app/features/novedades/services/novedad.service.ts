import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import {
  aFechaApi,
  aFechaHastaApi,
  API_ENDPOINTS,
  BaseHttpService,
  PaginatedResponse,
} from '../../../core';
import { MembresiaClienteService } from '../../contenedores/services/membresia-cliente.service';
import { Novedad, NovedadListaParams } from '../models/novedad.model';

@Injectable({ providedIn: 'root' })
export class NovedadService extends BaseHttpService {
  private readonly membresiaCliente = inject(MembresiaClienteService);

  listar(params: NovedadListaParams): Observable<PaginatedResponse<Novedad>> {
    return this.get<PaginatedResponse<Novedad>>(API_ENDPOINTS.novedad.lista, {
      page: params.page,
      size: params.size,
      codigo_tercero_fk: this.membresiaCliente.clienteId(),
      codigo_guia_fk: params.codigo_guia_fk,
      estado_atendido: params.estado_atendido,
      estado_solucion: params.estado_solucion,
      fecha_desde: params.fecha_desde ? aFechaApi(params.fecha_desde) : null,
      fecha_hasta: params.fecha_hasta ? aFechaHastaApi(params.fecha_hasta) : null,
    });
  }
}
