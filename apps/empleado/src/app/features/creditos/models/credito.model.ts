export interface CreditoSolicitud {
  codigo_credito_solicitud_pk: number;
  usuario_id: number;
  monto: number;
  plazo: number;
  tasa_interes: number;
  descripcion: string;
  estado: string;
  fecha_creacion: string;
  fecha_actualizacion: string;
}

export interface PlanCredito {
  num_cuotas: number;
  tasa_interes: number;
  tasa_interes_display: string;
  vr_cuota: number;
  vr_intereses: number;
  vr_total: number;
}

export interface CreditoConfiguracion {
  codigo_configuracion_pk: number;
  tasa_interes: number;
}

export interface CreditoSolicitudPayload {
  monto: number;
  plazo: number;
  tasa_interes: number;
  descripcion: string;
}
