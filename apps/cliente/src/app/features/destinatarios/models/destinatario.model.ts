/** Destinatario (`DestinatarioResponse` de fluor). */
export interface Destinatario {
  codigo_destinatario_pk: number;
  codigo_identificacion_fk: string | null;
  numero_identificacion: string | null;
  nombre_corto: string | null;
  direccion: string | null;
  telefono: string | null;
  codigo_ciudad_fk: string | null;
  ciudad_nombre: string | null;
  estado_inactivo: boolean | null;
}

/** Datos del formulario para `POST /tte/destinatario/nuevo`; el cliente lo pone el servicio. */
export interface DestinatarioNuevo {
  codigo_identificacion_fk: string;
  numero_identificacion: string;
  nombre_corto: string;
  direccion: string;
  telefono: string;
  codigo_ciudad_fk: string;
}

/** Parámetros de `GET /tte/destinatario/lista`. */
export interface DestinatarioListaParams {
  page: number;
  size: number;
  codigo_destinatario_pk?: number | null;
  nombre_corto?: string | null;
  numero_identificacion?: string | null;
}
