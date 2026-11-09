/** Fecha local en `YYYY-MM-DD`, el formato `date` que espera fluor. */
export function aFechaApi(fecha: Date): string {
  const mes = String(fecha.getMonth() + 1).padStart(2, '0');
  const dia = String(fecha.getDate()).padStart(2, '0');
  return `${fecha.getFullYear()}-${mes}-${dia}`;
}

/**
 * Límite superior para columnas `datetime`: fluor compara `columna <= fecha_hasta`
 * contra la medianoche de ese día, así que se envía el día siguiente para incluir
 * el día "hasta" completo.
 */
export function aFechaHastaApi(fecha: Date): string {
  const siguiente = new Date(fecha);
  siguiente.setDate(siguiente.getDate() + 1);
  return aFechaApi(siguiente);
}

/** Rango por defecto de los filtros: el día de hoy completo, igual que en terbio. */
export function rangoHoy(): { desde: Date; hasta: Date } {
  const desde = new Date();
  desde.setHours(0, 0, 0, 0);
  const hasta = new Date();
  hasta.setHours(23, 59, 59, 999);
  return { desde, hasta };
}
