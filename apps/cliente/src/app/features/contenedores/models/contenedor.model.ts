/**
 * Empresa a la que pertenece el usuario, tal como la devuelve
 * `/mas/user-tenant/lista`. La fila es la membresía del usuario en la empresa.
 */
export interface Contenedor {
  /** Id de la membresía (usuario-empresa), no de la empresa. */
  id: number;
  tenant_id: number;
  tenant_nombre: string | null;
  /** Solo se puede ingresar a una membresía activa. */
  activo: boolean;
  /** El usuario es propietario de la empresa. */
  control: boolean;
  /** El usuario entra a esta empresa como cliente. */
  cliente: boolean;
  /** Cliente (tercero) que representa el usuario; sin él no puede entrar al portal. */
  cliente_id: number | null;
  fecha_creacion: string;
}

/** Solo se puede entrar al portal con una membresía activa de cliente con `cliente_id`. */
export function puedeIngresar(contenedor: Contenedor): boolean {
  return contenedor.activo && contenedor.cliente && contenedor.cliente_id !== null;
}
