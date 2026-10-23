import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseHttpService, PaginatedResponse } from '../../../core';
import { Consigna, DetalleVencimiento, ProgramacionEmpleado, Turno } from '../models/turno.model';

@Injectable({ providedIn: 'root' })
export class TurnosService extends BaseHttpService {
  private readonly TURNOS_URL = '/tur/programacion/empleado';
  private readonly TURNO_PROGRAMACION_URL = '/tur/turno/programacion';
  private readonly CONSIGNAS_URL = '/tur/consigna/lista';

  /** Consulta la programación mensual de turnos para un empleado en un año y mes específicos. */
  getProgramacionEmpleado(
    empleadoId: number,
    anio: number,
    mes: number,
  ): Observable<ProgramacionEmpleado[]> {
    return this.get<ProgramacionEmpleado[]>(this.TURNOS_URL, {
      empleado_id: empleadoId,
      anio,
      mes,
    });
  }

  /** Obtiene el detalle de los turnos a partir de sus códigos. */
  getTurnosProgramacion(turnos: string[]): Observable<PaginatedResponse<Turno>> {
    return this.post<PaginatedResponse<Turno>>(this.TURNO_PROGRAMACION_URL, { turnos });
  }

  /** Obtiene el detalle de vencimientos de un empleado. */
  getDetalleVencimiento(empleadoId: number): Observable<DetalleVencimiento> {
    return this.get<DetalleVencimiento>('/rhu/empleado/detalle-vencimiento', {
      empleado_id: empleadoId,
    });
  }

  /** Obtiene las consignas habilitadas para el portal de un puesto. */
  getConsignas(puestoId: number): Observable<PaginatedResponse<Consigna>> {
    return this.get<PaginatedResponse<Consigna>>(this.CONSIGNAS_URL, {
      page: 1,
      size: 50,
      puesto_id: puestoId,
      habilitado_portal: true,
    });
  }
}
