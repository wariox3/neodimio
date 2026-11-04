import { Injectable, inject } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import {
  aFechaApi,
  aFechaHastaApi,
  API_ENDPOINTS,
  BaseHttpService,
  PaginatedResponse,
} from '../../../core';
import { TipoImpresion } from '../../catalogos/models/catalogo.model';
import { MembresiaClienteService } from '../../contenedores/services/membresia-cliente.service';
import {
  CondicionEspecialRequest,
  CondicionEspecialResponse,
  Guia,
  GuiaDetalle,
  GuiaListaParams,
  GuiaNovedad,
  GuiaNuevaRequest,
  GuiaNuevaResponse,
  LiquidarRequest,
  LiquidarResponse,
} from '../models/guia.model';

/**
 * Servicio de guías de transporte (módulo `tte` de fluor).
 * La empresa la pone el `tenantInterceptor` (`X-Tenant-ID`).
 */
@Injectable({ providedIn: 'root' })
export class GuiaService extends BaseHttpService {
  private readonly membresiaCliente = inject(MembresiaClienteService);

  listar(params: GuiaListaParams): Observable<PaginatedResponse<Guia>> {
    return this.get<PaginatedResponse<Guia>>(API_ENDPOINTS.guia.lista, {
      page: params.page,
      size: params.size,
      codigo_tercero_fk: this.membresiaCliente.clienteId(),
      fecha_desde: params.fecha_desde ? aFechaApi(params.fecha_desde) : null,
      fecha_hasta: params.fecha_hasta ? aFechaHastaApi(params.fecha_hasta) : null,
      ...(params.estado ? { [params.estado]: true } : {}),
      codigo_guia_pk: params.codigo_guia_pk,
      documento_cliente: params.documento_cliente || null,
      codigo_guia_tipo_fk: params.codigo_guia_tipo_fk,
      codigo_servicio_fk: params.codigo_servicio_fk,
      codigo_ciudad_origen_fk: params.codigo_ciudad_origen_fk,
      codigo_ciudad_destino_fk: params.codigo_ciudad_destino_fk,
      codigo_despacho_fk: params.codigo_despacho_fk,
      codigo_tercero_operacion_fk: params.codigo_tercero_operacion_fk,
    });
  }

  crear(guia: GuiaNuevaRequest): Observable<GuiaNuevaResponse> {
    return this.post<GuiaNuevaResponse>(API_ENDPOINTS.guia.nuevo, guia);
  }

  /** Calcula flete, manejo y peso facturado sin crear la guía. */
  liquidar(parametros: LiquidarRequest): Observable<LiquidarResponse> {
    return this.post<LiquidarResponse>(API_ENDPOINTS.guia.liquidar, parametros);
  }

  /** Precio y condiciones especiales de flete y manejo del cliente para un origen/destino. */
  condicionEspecial(parametros: CondicionEspecialRequest): Observable<CondicionEspecialResponse> {
    return this.post<CondicionEspecialResponse>(API_ENDPOINTS.guia.condicionEspecial, parametros);
  }

  obtener(id: number): Observable<GuiaDetalle> {
    return this.get<GuiaDetalle>(API_ENDPOINTS.guia.detalle(id));
  }

  novedades(guiaId: number): Observable<GuiaNovedad[]> {
    return this.get<PaginatedResponse<GuiaNovedad>>(API_ENDPOINTS.novedad.lista, {
      codigo_guia_fk: guiaId,
      codigo_tercero_fk: this.membresiaCliente.clienteId(),
    }).pipe(map((res) => res.items));
  }

  /**
   * PDF de una sola guía. fluor imprime por rango de números, y un rango más amplio
   * incluiría guías que no están en el filtro de la pantalla.
   */
  imprimir(tipo: TipoImpresion, guiaId: number, formato: number): Observable<Blob> {
    const path =
      tipo === 'guia' ? API_ENDPOINTS.guia.imprimirGuia : API_ENDPOINTS.guia.imprimirRotulo;
    return this.http
      .get(`${this.baseUrl}${path}`, {
        params: { numero_desde: guiaId, numero_hasta: guiaId, formato },
        responseType: 'blob',
        observe: 'response',
      })
      .pipe(map((res: HttpResponse<Blob>) => res.body as Blob));
  }
}
