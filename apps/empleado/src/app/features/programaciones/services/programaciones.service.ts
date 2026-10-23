import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseHttpService, PaginatedResponse } from '../../../core';
import {
  CreateProgramacionReporteRequest,
  ProgramacionEmpleado,
  ProgramacionReporte,
  ProgramacionReporteTipo,
  Turno,
} from '../models/programacion.model';

@Injectable({ providedIn: 'root' })
export class ProgramacionesService extends BaseHttpService {
  private readonly PROGRAMACION_URL = '/tur/programacion/empleado';
  private readonly REPORTE_TIPOS_URL = '/tur/programacion_reporte_tipo/lista';
  private readonly REPORTE_CREATE_URL = '/tur/programacion_reporte/nuevo';
  private readonly TURNO_PROGRAMACION_URL = '/tur/turno/programacion';

  /** Consulta la programación mensual de turnos para un empleado en un año y mes específicos. */
  getProgramacionEmpleado(
    empleadoId: number,
    anio: number,
    mes: number,
  ): Observable<ProgramacionEmpleado[]> {
    return this.get<ProgramacionEmpleado[]>(this.PROGRAMACION_URL, {
      empleado_id: empleadoId,
      anio,
      mes,
    });
  }

  /** Obtiene el detalle de los turnos a partir de sus códigos. */
  getTurnosProgramacion(turnos: string[]): Observable<PaginatedResponse<Turno>> {
    return this.post<PaginatedResponse<Turno>>(this.TURNO_PROGRAMACION_URL, { turnos });
  }

  /** Obtiene la lista de tipos de reporte de programación. */
  getReporteTipos(): Observable<PaginatedResponse<ProgramacionReporteTipo>> {
    return this.get<PaginatedResponse<ProgramacionReporteTipo>>(this.REPORTE_TIPOS_URL, {
      size: 200,
    });
  }

  /** Crea un nuevo reporte de programación. */
  createReporte(body: CreateProgramacionReporteRequest): Observable<ProgramacionReporte> {
    return this.post<ProgramacionReporte>(this.REPORTE_CREATE_URL, body);
  }

}
