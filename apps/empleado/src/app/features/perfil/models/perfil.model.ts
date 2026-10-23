export interface PerfilDetalle {
  nombres: string | null;
  apellidos: string | null;
  numero_identificacion: string | null;
  empleado_id: number | null;
  email: string;
}

export interface UpdatePerfilRequest {
  nombres: string;
  apellidos: string;
  numero_identificacion: string;
}
