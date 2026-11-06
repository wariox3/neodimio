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

/** Ciudad general (`GET /gen/ciudad/descargar`); distinta de la de transporte. */
export interface CiudadGeneral {
  codigo_ciudad_pk: number;
  nombre: string | null;
}

/** Valores generales de la empresa para crear guías (`GET /gen/configuracion/guia-nuevo`). */
export interface ConfiguracionGeneral {
  codigo_precio_general_fk: number | null;
  codigo_condicion_general_fk: number | null;
  codigo_asesor_general_fk: number | null;
}

/** Tercero del buscador de adquirientes (`GET /gen/tercero/buscar`, páginas de 10). */
export interface TerceroBuscar {
  codigo_tercero_pk: number;
  numero_identificacion: string | null;
  nombre_corto: string | null;
  condicion_nombre: string | null;
  estado_inactivo: boolean | null;
}

/** Cuerpo de `POST /gen/tercero/nuevo` (`TerceroCreateRequest` de fluor), lo que usa el portal. */
export interface TerceroNuevoRequest {
  codigo_identificacion_fk: string;
  numero_identificacion: string;
  digito_verificacion: string | null;
  codigo_ciudad_fk: number;
  nombre_corto: string;
  nombre_extendido: string;
  codigo_tipo_persona_fk: string | null;
  codigo_regimen_fk: string | null;
  nombre1: string;
  nombre2: string | null;
  apellido1: string;
  apellido2: string | null;
  direccion: string;
  telefono: string;
  celular: string;
  correo: string;
  codigo_asesor_fk: number;
  codigo_condicion_fk: number;
  codigo_operacion_fk: string | null;
  cliente: boolean;
  guia_pago_contado: boolean;
  guia_pago_destino: boolean;
}

/** Filtros del buscador de terceros, los mismos de `buscarAdquiriente` de terbio. */
export interface TerceroBuscarParams {
  page: number;
  nombre_corto?: string | null;
  numero_identificacion?: string | null;
  codigo_tercero_pk?: number | null;
}

/** Permisos y valores por defecto del usuario al crear guías, como los tenía terbio. */
export interface PermisosGuia {
  /** Puede digitar el flete y el manejo en lugar de dejar los liquidados. */
  cambiar_valores_guia: boolean;
  /** Puede elegir otro adquiriente para la factura electrónica. */
  permite_cambiar_adquiriente: boolean;
  /** Estados con los que nacen sus guías. */
  estado_recogido: boolean;
  estado_ingreso: boolean;
  /** Las condiciones se consultan con el destino como origen y viceversa. */
  invertir_origen_destino: boolean;
  /** El recaudo queda en 0 y no se puede editar. */
  bloquear_recaudo: boolean;
  /** En los tipos de guía a crédito el adquiriente es siempre su cliente. */
  bloquear_adquiriente_credito: boolean;
  /** La operación queda fija en la de su configuración. */
  bloquear_operacion_cliente: boolean;
}

/** Los mismos valores por defecto de fluor, para cuando no se puede leer la configuración. */
export const PERMISOS_GUIA_POR_DEFECTO: PermisosGuia = {
  cambiar_valores_guia: false,
  permite_cambiar_adquiriente: false,
  estado_recogido: true,
  estado_ingreso: true,
  invertir_origen_destino: false,
  bloquear_recaudo: false,
  bloquear_adquiriente_credito: false,
  bloquear_operacion_cliente: false,
};

/** Configuración del usuario en la empresa (`GET /mas/user-tenant-configuracion/{id}`). */
export interface ConfiguracionUsuario extends PermisosGuia {
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
