/**
 * Empresa a la que pertenece el usuario, tal como la devuelve
 * `/mas/user-tenant/lista`. La fila es la membresía del usuario en la empresa.
 */
export interface Contenedor {
  /** Id de la membresía (usuario-empresa), no de la empresa. */
  id: number;
  tenant_id: number;
  tenant_nombre: string | null;
  empleado_id: number | null;
  /** Solo se puede ingresar a una membresía activa. */
  activo: boolean;
  /** El usuario es propietario de la empresa: puede invitar y ver los miembros. */
  control: boolean;
  fecha_creacion: string;
}

/** Miembro de una empresa, tal como lo devuelve `/mas/user-tenant/lista-tenant`. */
export interface ContenedorMiembro {
  /** Id de la membresía (usuario-empresa). */
  id: number;
  usuario_id: number;
  email: string;
  nombres: string | null;
  apellidos: string | null;
  empleado_id: number | null;
  activo: boolean;
  /** Propietario de la empresa: puede invitar y ver los miembros. */
  control: boolean;
  fecha_creacion: string;
}

/** Cuerpo de `POST /mas/invitacion/nuevo`. */
export interface InvitacionRequest {
  tenant_id: number;
  usuario_invitado_id: number;
}
