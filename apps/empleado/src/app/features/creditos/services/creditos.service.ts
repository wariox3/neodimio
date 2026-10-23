import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { BaseHttpService, PaginatedResponse } from '../../../core';
import {
  CreditoConfiguracion,
  CreditoSolicitud,
  CreditoSolicitudPayload,
  PlanCredito,
} from '../models/credito.model';

const PLAZOS = [1, 3, 6];

@Injectable({ providedIn: 'root' })
export class CreditosService extends BaseHttpService {
  getConfiguracion(): Observable<CreditoConfiguracion> {
    return this.get<CreditoConfiguracion>('/mas/configuracion');
  }

  getCreditos(): Observable<CreditoSolicitud[]> {
    return this.get<PaginatedResponse<CreditoSolicitud>>('/mas/credito-solicitud/lista-portal').pipe(
      map((res) => res.items),
    );
  }

  calcularPlanes(monto: number, tasaAnual: number): PlanCredito[] {
    const tasaMensual = tasaAnual / 100 / 12;
    return PLAZOS.map((plazo) => {
      const vr_intereses = Math.round(monto * tasaMensual * plazo);
      const vr_total = monto + vr_intereses;
      const vr_cuota = Math.round(vr_total / plazo);
      return {
        num_cuotas: plazo,
        tasa_interes: tasaMensual,
        tasa_interes_display: `${(tasaMensual * 100).toFixed(2)}% mensual`,
        vr_cuota,
        vr_intereses,
        vr_total,
      };
    });
  }

  crearCredito(payload: CreditoSolicitudPayload): Observable<unknown> {
    return this.post('/mas/credito-solicitud/nuevo', payload);
  }
}
