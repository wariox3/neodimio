/** Datos de una persona que alcanzan para nombrarla en la interfaz. */
interface PersonaNombrable {
  email: string;
  nombres: string | null;
  apellidos: string | null;
}

/** Nombre completo; vacío si la persona no tiene nombre cargado. */
export function nombreCompleto(persona: PersonaNombrable): string {
  return `${persona.nombres ?? ''} ${persona.apellidos ?? ''}`.trim();
}

/** Hasta dos iniciales del nombre, o la primera letra del correo. */
export function iniciales(persona: PersonaNombrable): string {
  return inicialesDe(nombreCompleto(persona), persona.email);
}

/** Hasta dos iniciales de `nombre`; sin nombre, la primera letra de `email`. */
export function inicialesDe(nombre: string | null, email: string): string {
  const limpio = nombre?.trim();
  if (!limpio) return email.charAt(0).toUpperCase();
  return limpio
    .split(/\s+/)
    .slice(0, 2)
    .map((parte) => parte.charAt(0).toUpperCase())
    .join('');
}
