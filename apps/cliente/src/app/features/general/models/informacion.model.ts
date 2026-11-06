/** Datos del cliente que se muestran en "Información" (`TerceroDetalleResponse` de fluor). */
export interface InformacionCliente {
  codigo_tercero_pk: number;
  nombre_corto: string | null;
  codigo_identificacion_fk: string | null;
  numero_identificacion: string | null;
  digito_verificacion: string | null;
  direccion: string | null;
  barrio: string | null;
  ciudad_nombre: string | null;
  telefono: string | null;
  celular: string | null;
  correo: string | null;
  asesor_nombre: string | null;
}

/** Modelo con el que fluor guarda los archivos de un tercero. */
export const MODELO_TERCERO = 'GenTercero';

/** Identificación con su tipo y dígito de verificación, por ejemplo `NI 900123456-7`. */
export function identificacionCliente(
  cliente: Pick<
    InformacionCliente,
    'codigo_identificacion_fk' | 'numero_identificacion' | 'digito_verificacion'
  >,
): string {
  if (!cliente.numero_identificacion) return '—';
  const numero = cliente.digito_verificacion
    ? `${cliente.numero_identificacion}-${cliente.digito_verificacion}`
    : cliente.numero_identificacion;
  return cliente.codigo_identificacion_fk
    ? `${cliente.codigo_identificacion_fk} ${numero}`
    : numero;
}
