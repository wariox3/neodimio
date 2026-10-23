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

export type InvitacionEstado = 'pendiente' | 'aceptada' | 'rechazada' | 'cancelada';

/** Invitación enviada por una empresa, tal como la devuelve `/mas/invitacion/lista`. */
export interface InvitacionEmpresa {
  id: number;
  usuario_invitado_id: number;
  usuario_invitado_nombre: string | null;
  usuario_invitado_email: string;
  /** Quien invitó; `null` si su usuario fue eliminado. */
  usuario_id: number | null;
  usuario_nombre: string | null;
  usuario_email: string | null;
  estado: InvitacionEstado;
  fecha: string;
}

/** Usuario que se puede invitar, tal como lo devuelve `/auth/user/seleccionar`. */
export interface UsuarioSeleccionar {
  id: number;
  email: string;
  nombres: string | null;
  apellidos: string | null;
}

/** Invitación recibida por el usuario, tal como la devuelve `/mas/invitacion/pendientes`. */
export interface InvitacionRecibida {
  id: number;
  tenant_id: number;
  tenant_nombre: string | null;
  /** Quien invitó; `null` si su usuario fue eliminado. */
  usuario_id: number | null;
  usuario_nombre: string | null;
  usuario_email: string | null;
  fecha: string;
}
