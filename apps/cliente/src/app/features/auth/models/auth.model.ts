import { BaseUsuario } from '@semantica/core';

/** Usuario autenticado del portal de clientes (respuesta de `/me` y del login). */
export interface Usuario extends BaseUsuario {
  nombres?: string | null;
  apellidos?: string | null;
}

/** Datos del registro (`RegisterRequest` de fluor). */
export interface RegisterRequest {
  email: string;
  password: string;
  nombres: string;
  apellidos: string;
  numero_identificacion: string;
  turnstile_token?: string;
}

/** Respuesta del registro; `verification_link` solo llega con DEBUG en fluor. */
export interface RegisterResponse {
  user: Usuario;
  verification_link?: string;
}
