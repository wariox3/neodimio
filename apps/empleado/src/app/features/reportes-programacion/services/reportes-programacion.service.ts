import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseHttpService, PaginatedResponse } from '../../../core';
import { ProgramacionReporte, ProgramacionReporteRespuesta } from '../models/reporte-programacion.model';

@Injectable({ providedIn: 'root' })
export class ReportesProgramacionService extends BaseHttpService {
  private readonly REPORTE_LISTA_URL = '/tur/programacion_reporte/lista';
  private readonly REPORTE_RESPUESTAS_URL = '/tur/programacion_reporte_respuesta/lista';

  /** Obtiene la lista paginada de reportes de un empleado. */
  getReportes(
    empleadoId: number,
    page = 1,
    size = 50,
  ): Observable<PaginatedResponse<ProgramacionReporte>> {
    return this.get<PaginatedResponse<ProgramacionReporte>>(this.REPORTE_LISTA_URL, {
      empleado_id: empleadoId,
      page,
      size,
    });
  }

  /** Obtiene las respuestas de un reporte de programación. */
  getRespuestasReporte(
    programacionId: number,
  ): Observable<PaginatedResponse<ProgramacionReporteRespuesta>> {
    return this.get<PaginatedResponse<ProgramacionReporteRespuesta>>(this.REPORTE_RESPUESTAS_URL, {
      programacion_reporte_id: programacionId,
      size: 50,
      page: 1,
    });
  }
}
