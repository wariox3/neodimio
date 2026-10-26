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

/** Usuario de una empresa, tal como lo devuelve `/mas/user-tenant/lista-tenant`. */
export interface UsuarioTenantItem {
  /** Id de la membresía (usuario-empresa). */
  id: number;
  usuario_id: number;
  email: string;
  nombres: string | null;
  apellidos: string | null;
  empleado_id: number | null;
  /** Código del usuario en Semantica. */
  codigo_usuario_fk: string | null;
  activo: boolean;
  /** Propietario de la empresa. */
  control: boolean;
  /** Tiene acceso al ERP. */
  erp: boolean;
  fecha_creacion: string;
}

/** Filtros del listado de usuarios de la empresa. */
export interface UsuarioTenantFilters {
  /** Acceso al ERP. */
  erp?: boolean | null;
  /** Propietario de la empresa. */
  control?: boolean | null;
  /** Coincidencia parcial con el correo. */
  email?: string | null;
  /** Código exacto del usuario en Semantica. */
  codigoUsuario?: string | null;
}

/** Longitud máxima de `codigo_usuario_fk` que acepta el backend. */
export const CODIGO_USUARIO_MAX_LENGTH = 25;

/**
 * Cuerpo de `PATCH /mas/user-tenant/{id}/actualizar`. Solo se puede cambiar el
 * código; `null` lo limpia.
 */
export interface UsuarioTenantUpdateRequest {
  codigo_usuario_fk: string | null;
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
