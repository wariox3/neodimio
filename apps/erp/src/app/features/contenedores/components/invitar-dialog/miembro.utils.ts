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
  const nombre = nombreCompleto(persona);
  if (!nombre) return persona.email.charAt(0).toUpperCase();
  return nombre
    .split(/\s+/)
    .slice(0, 2)
    .map((parte) => parte.charAt(0).toUpperCase())
    .join('');
}
