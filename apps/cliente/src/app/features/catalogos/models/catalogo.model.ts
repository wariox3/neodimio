/** Opción genérica para los `p-select` de catálogos. */
export interface OpcionCatalogo<T = string> {
  value: T;
  label: string;
}

/** Ciudad de transporte (`GET /tte/ciudad/descargar`). */
export interface Ciudad {
  codigo_ciudad_pk: string;
  nombre: string | null;
  departamento_nombre: string | null;
  codigo_zona_fk: string | null;
}

/** Tipo de guía (`GET /tte/guia-tipo/descargar`). */
export interface GuiaTipo {
  codigo_guia_tipo_pk: string;
  nombre: string | null;
  /** Código de `tte_pago`: `COR`, `CON`, `DES` o `CTS`. */
  codigo_pago_fk: string | null;
  validar_flete: boolean | null;
}

/**
 * Datos del tercero que usa el portal (`GET /gen/tercero/detalle/{id}`).
 * Los `guia_pago_*` son los tipos de pago que tiene habilitados para sus guías.
 */
export interface Tercero {
  codigo_tercero_pk: number;
  codigo_identificacion_fk: string | null;
  numero_identificacion: string | null;
  nombre_corto: string | null;
  codigo_operacion_fk: string | null;
  codigo_condicion_fk: number | null;
  condicion_codigo_precio_fk: number | null;
  guia_pago_credito: boolean | null;
  guia_pago_contado: boolean | null;
  guia_pago_destino: boolean | null;
  guia_pago_cortesia: boolean | null;
  liquidar_guia_peso: boolean | null;
  liquidar_guia_unidad: boolean | null;
}

/** Permiso del tercero que exige cada código de pago del tipo de guía. */
const PERMISO_POR_PAGO: Record<string, keyof Tercero> = {
  COR: 'guia_pago_credito',
  CON: 'guia_pago_contado',
  DES: 'guia_pago_destino',
  CTS: 'guia_pago_cortesia',
};

/**
 * Tipos de guía que puede usar el tercero. Replica el filtro de terbio: un tipo se
 * oculta si su forma de pago no está habilitada, y uno sin forma de pago queda para todos.
 */
/**
 * Como en terbio (`validarFlete`): la guía no se guarda con flete en 0 si el tipo lo valida,
 * salvo cortesía. El catálogo no trae la bandera `cortesia`; su pago es `CTS`.
 */
export function exigeFlete(tipo: GuiaTipo | undefined): boolean {
  return !!tipo?.validar_flete && tipo.codigo_pago_fk !== 'CTS';
}

export function tiposDisponibles(tipos: GuiaTipo[], tercero: Tercero): GuiaTipo[] {
  return tipos.filter((tipo) => {
    const permiso = PERMISO_POR_PAGO[tipo.codigo_pago_fk ?? ''];
    return !permiso || !!tercero[permiso];
  });
}

/** Configuración del usuario en la empresa (`GET /mas/user-tenant-configuracion/{id}`). */
export interface ConfiguracionUsuario {
  user_tenant_id: number;
  /** Operación por la que ingresan las guías del usuario (`tte_operacion`). */
  codigo_operacion_fk: string | null;
  /** Operación del cliente que se selecciona por defecto al crear una guía. */
  codigo_tercero_operacion_fk: number | null;
  /** Ciudad de origen propia del usuario; sin ella se usa la de su operación. */
  codigo_ciudad_origen_fk: string | null;
}

/** Operación de la empresa (`GET /tte/operacion/detalle/{codigo}`). */
export interface Operacion {
  codigo_operacion_pk: string;
  nombre: string | null;
  codigo_ciudad_fk: string | null;
}

/** Operación de un tercero (`GET /tte/tercero-operacion/lista`). */
export interface TerceroOperacion {
  codigo_tercero_operacion_pk: number;
  codigo: string | null;
  nombre: string | null;
}

/** Producto habilitado para un tercero (`GET /tte/tercero-producto/buscar`). */
export interface TerceroProducto {
  codigo_producto_fk: string | null;
  producto_nombre: string | null;
}

/** Producto genérico que terbio ofrece a todos los clientes. */
export const PRODUCTO_VARIOS: OpcionCatalogo = { value: 'VARIOS', label: 'VARIOS' };

/** Opciones del select de producto: siempre `VARIOS` primero y luego los del tercero. */
export function opcionesProducto(productos: TerceroProducto[]): OpcionCatalogo[] {
  const opciones = [PRODUCTO_VARIOS];
  for (const { codigo_producto_fk: codigo, producto_nombre: nombre } of productos) {
    if (codigo && codigo !== PRODUCTO_VARIOS.value) {
      opciones.push({ value: codigo, label: nombre ?? codigo });
    }
  }
  return opciones;
}

export interface Servicio {
  codigo_servicio_pk: string;
  nombre: string | null;
}

export interface Identificacion {
  codigo_identificacion_pk: string;
  nombre: string | null;
}

export type TipoImpresion = 'guia' | 'rotulo';

/** Formato de impresión disponible (`GET /tte/guia/formatos-impresion`). */
export interface FormatoImpresion {
  codigo: number;
  nombre: string;
  predeterminado: boolean;
}
