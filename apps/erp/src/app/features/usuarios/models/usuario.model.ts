import { BaseUsuario } from '../../../core';

/**
 * Usuario tal como lo devuelve `/auth/user/lista`.
 *
 * Extiende `BaseUsuario` (id, email, role) con los datos personales y el
 * estado de verificación que expone el listado.
 */
export interface UsuarioListItem extends BaseUsuario {
  nombres: string | null;
  apellidos: string | null;
  is_verified: boolean;
}

/** Cuerpo para crear un usuario en `/auth/user/nuevo`. */
export interface CreateUsuarioRequest {
  email: string;
  password: string;
  role: string;
  tenant_id: number;
}

export interface RoleOption {
  label: string;
  value: string;
}

/** Roles válidos que un administrador puede asignar (enum del backend). */
export const USER_ROLES: RoleOption[] = [
  { label: 'Administrador', value: 'admin' },
  { label: 'Usuario', value: 'user' },
  { label: 'Visualizador', value: 'viewer' },
  { label: 'Control', value: 'control' },
  { label: 'Empleado', value: 'employee' },
];
