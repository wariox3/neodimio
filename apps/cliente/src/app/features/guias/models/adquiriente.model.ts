import { AbstractControl, ValidationErrors } from '@angular/forms';
import { TerceroNuevoRequest } from '../../catalogos/models/catalogo.model';

/** Longitud que exige terbio al número de un NIT (sin dígito de verificación). */
export const LONGITUD_NIT = 9;

/** Pesos de la DIAN para el dígito de verificación, del último dígito hacia el primero. */
const PESOS_DIAN = [3, 7, 13, 17, 19, 23, 29, 37, 41, 43, 47, 53, 59, 67, 71];

/**
 * Dígito de verificación de la DIAN, como `devuelveDigitoVerificacion` de holmio.
 * `null` si el número no es numérico o es más largo de lo que admite la DIAN.
 */
export function digitoVerificacion(numero: string): string | null {
  if (!/^\d+$/.test(numero) || numero.length > PESOS_DIAN.length) return null;
  const suma = [...numero]
    .reverse()
    .reduce((total, digito, i) => total + Number(digito) * PESOS_DIAN[i], 0);
  const residuo = suma % 11;
  return String(residuo > 1 ? 11 - residuo : residuo);
}

/**
 * Validador del formulario: como terbio, un NIT debe tener 9 dígitos. Se valida en el
 * grupo porque depende del tipo de identificación.
 */
export function validarNit(group: AbstractControl): ValidationErrors | null {
  const tipo = group.get('codigo_identificacion_fk')?.value;
  const numero: string = group.get('numero_identificacion')?.value ?? '';
  if (tipo !== 'NI' || !numero) return null;
  return /^\d+$/.test(numero) && numero.length === LONGITUD_NIT ? null : { nit: true };
}

/** Valores del formulario de adquiriente nuevo, los mismos campos de terbio. */
export interface ValoresAdquirienteNuevo {
  codigo_identificacion_fk: string;
  numero_identificacion: string;
  nombre_corto: string;
  nombre1: string;
  nombre2: string;
  apellido1: string;
  apellido2: string;
  telefono: string;
  celular: string;
  direccion: string;
  correo: string;
  codigo_ciudad_fk: number | null;
}

/** Datos que holmio tomaba de la configuración y no del formulario. */
export interface ContextoAdquirienteNuevo {
  /** Asesor y condición generales de la empresa (`gen_configuracion`). */
  asesor: number;
  condicion: number;
  /** Operación de ingreso del usuario. */
  operacion: string | null;
}

/** Tipo de persona y régimen que asignaba holmio según la identificación. */
const PERFIL_POR_IDENTIFICACION: Record<string, { tipoPersona: string; regimen: string }> = {
  CC: { tipoPersona: 'N', regimen: 'S' },
  NI: { tipoPersona: 'J', regimen: 'O' },
};

/**
 * Cuerpo para crear el adquiriente, como `apiOxigenoNuevo` de holmio: queda como cliente,
 * con pago de contado y destino habilitado y el asesor y la condición generales.
 */
export function cuerpoAdquirienteNuevo(
  v: ValoresAdquirienteNuevo,
  ctx: ContextoAdquirienteNuevo,
): TerceroNuevoRequest {
  const perfil = PERFIL_POR_IDENTIFICACION[v.codigo_identificacion_fk];
  return {
    codigo_identificacion_fk: v.codigo_identificacion_fk,
    numero_identificacion: v.numero_identificacion,
    digito_verificacion: digitoVerificacion(v.numero_identificacion),
    codigo_ciudad_fk: v.codigo_ciudad_fk ?? 0,
    nombre_corto: v.nombre_corto,
    nombre_extendido: v.nombre_corto,
    codigo_tipo_persona_fk: perfil?.tipoPersona ?? null,
    codigo_regimen_fk: perfil?.regimen ?? null,
    nombre1: v.nombre1,
    nombre2: v.nombre2 || null,
    apellido1: v.apellido1,
    apellido2: v.apellido2 || null,
    direccion: v.direccion,
    telefono: v.telefono,
    celular: v.celular,
    correo: v.correo,
    codigo_asesor_fk: ctx.asesor,
    codigo_condicion_fk: ctx.condicion,
    codigo_operacion_fk: ctx.operacion,
    cliente: true,
    guia_pago_contado: true,
    guia_pago_destino: true,
  };
}
