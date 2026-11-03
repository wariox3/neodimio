/** Usuario de una empresa, tal como lo devuelve `/mas/user-tenant/lista-tenant`. */
export interface UsuarioTenantItem {
  /** Id de la membresía (usuario-empresa). */
  id: number;
  usuario_id: number;
  email: string;
  nombres: string | null;
  apellidos: string | null;
  /** El usuario entra como empleado de la empresa. */
  empleado: boolean;
  /** Se asigna al asociarse como empleado; no se puede cambiar desde esta pantalla. */
  empleado_id: number | null;
  /** El usuario entra como cliente de la empresa. */
  cliente: boolean;
  cliente_id: number | null;
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

/** Longitud máxima de `codigo_operacion_fk` que acepta el backend. */
export const CODIGO_OPERACION_MAX_LENGTH = 20;

/** Longitud máxima de `codigo_ciudad_origen_fk` que acepta el backend. */
export const CODIGO_CIUDAD_ORIGEN_MAX_LENGTH = 20;

/**
 * Cuerpo de `PATCH /mas/user-tenant/{id}/actualizar`. Solo se cambian los campos
 * enviados; `null` limpia `codigo_usuario_fk` y `cliente_id`.
 */
export interface UsuarioTenantUpdateRequest {
  codigo_usuario_fk?: string | null;
  cliente?: boolean;
  cliente_id?: number | null;
}

/** Configuración del usuario en la empresa (`GET /mas/user-tenant-configuracion/{id}`). */
export interface UsuarioTenantConfiguracion {
  user_tenant_id: number;
  /** Operación de `tte_operacion` por la que ingresan sus guías. */
  codigo_operacion_fk: string | null;
  /** Operación del cliente que se selecciona por defecto al crear una guía. */
  codigo_tercero_operacion_fk: number | null;
  /** Ciudad de origen de sus guías; sin ella se usa la de su operación. */
  codigo_ciudad_origen_fk: string | null;
}

/**
 * Cuerpo de `PATCH /mas/user-tenant-configuracion/{id}/actualizar`. Solo se cambian
 * los campos enviados; `null` los limpia.
 */
export type UsuarioTenantConfiguracionUpdateRequest = Partial<
  Omit<UsuarioTenantConfiguracion, 'user_tenant_id'>
>;
