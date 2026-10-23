/**
 * Empresa a la que pertenece el usuario, tal como la devuelve
 * `/mas/user-tenant/lista`. La fila es la membresía del usuario en la empresa.
 */
export interface Membresia {
  /** Id de la membresía (usuario-empresa), no de la empresa. */
  id: number;
  tenant_id: number;
  tenant_nombre: string | null;
  /** Empleado del usuario en esa empresa. */
  empleado_id: number | null;
  activo: boolean;
  control: boolean;
  fecha_creacion: string;
}
