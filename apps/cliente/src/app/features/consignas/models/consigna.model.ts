/** Consigna de un puesto del cliente (`ConsignaResponse` de fluor, módulo de turnos). */
export interface Consigna {
  codigo_consigna_pk: number;
  /** `null` en las consignas generales, que aplican a todos los puestos. */
  codigo_puesto_fk: number | null;
  puesto_nombre: string | null;
  consigna: string | null;
  habilitado_portal: boolean | null;
}

/** Opción del filtro por puesto. */
export interface PuestoOpcion {
  /** Clave del puesto (ver `clavePuesto`). */
  value: string;
  label: string;
}

/** Nombre con el que se muestran las consignas que no tienen puesto. */
export const CONSIGNAS_GENERALES = 'Generales';

/** Clave con la que se agrupan las consignas generales en el filtro. */
const CLAVE_GENERALES = 'generales';

/** Clave del puesto de la consigna para el filtro: su id, o `generales` si no tiene puesto. */
export function clavePuesto(consigna: Pick<Consigna, 'codigo_puesto_fk'>): string {
  return consigna.codigo_puesto_fk === null ? CLAVE_GENERALES : String(consigna.codigo_puesto_fk);
}

/** Puestos presentes en las consignas, sin repetir, ordenados por nombre; las generales primero. */
export function puestosDeConsignas(consignas: Consigna[]): PuestoOpcion[] {
  const puestos = new Map<string, string>();
  for (const c of consignas) {
    const clave = clavePuesto(c);
    if (!puestos.has(clave)) {
      puestos.set(
        clave,
        c.codigo_puesto_fk === null
          ? CONSIGNAS_GENERALES
          : (c.puesto_nombre ?? `Puesto ${c.codigo_puesto_fk}`),
      );
    }
  }
  return [...puestos.entries()]
    .map(([value, label]) => ({ value, label }))
    .sort((a, b) =>
      a.value === CLAVE_GENERALES
        ? -1
        : b.value === CLAVE_GENERALES
          ? 1
          : a.label.localeCompare(b.label, 'es'),
    );
}
