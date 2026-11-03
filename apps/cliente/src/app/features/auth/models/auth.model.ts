import { BaseUsuario } from '@semantica/core';

/** Usuario autenticado del portal de clientes (respuesta de `/me` y del login). */
export interface Usuario extends BaseUsuario {
  nombres?: string | null;
  apellidos?: string | null;
}
