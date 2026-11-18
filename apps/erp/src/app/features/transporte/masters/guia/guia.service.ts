import { formatDate } from '@angular/common';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_ENDPOINTS, BaseHttpService, PaginatedResponse } from '@erp/core';
import { GUIA_ESTADO_PARAMS } from './guia.constants';
import { Guia, GuiaCiudad, GuiaDetalle, GuiaFiltros } from './guia.model';

/** Fecha local en el formato que espera fluor; sin zona horaria para no cambiar de día. */
function aFechaApi(fecha: Date | null): string | null {
  return fecha ? formatDate(fecha, 'yyyy-MM-dd', 'en-US') : null;
}

/** Guías de transporte (módulo `tte` de fluor) de la empresa activa. */
@Injectable({ providedIn: 'root' })
export class GuiaService extends BaseHttpService {
  listar(page: number, size: number, filtros: GuiaFiltros): Observable<PaginatedResponse<Guia>> {
    return this.get<PaginatedResponse<Guia>>(API_ENDPOINTS.guia.lista, {
      page,
      size,
      codigo_guia_pk: filtros.codigo_guia_pk,
      documento_cliente: filtros.documento_cliente?.trim() || null,
      fecha_desde: aFechaApi(filtros.fecha_desde),
      fecha_hasta: aFechaApi(filtros.fecha_hasta),
      ...(filtros.estado ? GUIA_ESTADO_PARAMS[filtros.estado] : {}),
    });
  }

  obtener(id: number): Observable<GuiaDetalle> {
    return this.get<GuiaDetalle>(API_ENDPOINTS.guia.detalle(id));
  }

  /** El listado solo trae el código de las ciudades; este catálogo da sus nombres. */
  ciudades(): Observable<GuiaCiudad[]> {
    return this.get<GuiaCiudad[]>(API_ENDPOINTS.guia.ciudades);
  }
}
