/** Invitación pendiente de una empresa, tal como la devuelve `/mas/invitacion/lista`. */
export interface InvitacionPendiente {
  id: number;
  usuario_invitado_id: number;
  /** Nombres y apellidos del invitado; `null` si no los tiene cargados. */
  usuario_invitado_nombre: string | null;
  usuario_invitado_email: string;
  /** Quien invitó; `null` si su usuario fue eliminado. */
  usuario_id: number | null;
  usuario_nombre: string | null;
  usuario_email: string | null;
  fecha: string;
}
