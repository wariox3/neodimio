/** Usuario de una empresa, tal como lo devuelve `/mas/user-tenant/lista-tenant`. */
export interface UsuarioTenantItem {
  /** Id de la membresía (usuario-empresa). */
  id: number;
  usuario_id: number;
  email: string;
  nombres: string | null;
  apellidos: string | null;
  /** El usuario entra como empleado de la empresa. */
  empleado: boolean;
  /** Se asigna al asociarse como empleado; no se puede cambiar desde esta pantalla. */
  empleado_id: number | null;
  /** El usuario entra como cliente de la empresa. */
  cliente: boolean;
  cliente_id: number | null;
  /** Código del usuario en Semantica. */
  codigo_usuario_fk: string | null;
  activo: boolean;
  /** Propietario de la empresa. */
  control: boolean;
  /** Tiene acceso al ERP. */
  erp: boolean;
  fecha_creacion: string;
}

/** Filtros del listado de usuarios de la empresa. */
export interface UsuarioTenantFilters {
  /** Acceso al ERP. */
  erp?: boolean | null;
  /** Propietario de la empresa. */
  control?: boolean | null;
  /** Coincidencia parcial con el correo. */
  email?: string | null;
  /** Código exacto del usuario en Semantica. */
  codigoUsuario?: string | null;
}

/** Longitud máxima de `codigo_usuario_fk` que acepta el backend. */
export const CODIGO_USUARIO_MAX_LENGTH = 25;

/** Longitud máxima de `codigo_operacion_fk` que acepta el backend. */
export const CODIGO_OPERACION_MAX_LENGTH = 20;

/** Longitud máxima de `codigo_ciudad_origen_fk` que acepta el backend. */
export const CODIGO_CIUDAD_ORIGEN_MAX_LENGTH = 20;

/**
 * Cuerpo de `PATCH /mas/user-tenant/{id}/actualizar`. Solo se cambian los campos
 * enviados; `null` limpia `codigo_usuario_fk` y `cliente_id`.
 */
export interface UsuarioTenantUpdateRequest {
  codigo_usuario_fk?: string | null;
  cliente?: boolean;
  cliente_id?: number | null;
}

/** Permisos y valores por defecto del usuario al crear guías en el portal cliente. */
export type PermisoGuia =
  | 'cambiar_valores_guia'
  | 'bloquear_recaudo'
  | 'invertir_origen_destino'
  | 'permite_cambiar_adquiriente'
  | 'bloquear_adquiriente_credito'
  | 'bloquear_operacion_cliente'
  | 'estado_recogido'
  | 'estado_ingreso';

/** Mismos valores por defecto de fluor para un usuario sin configuración. */
export const PERMISOS_GUIA_POR_DEFECTO: Record<PermisoGuia, boolean> = {
  cambiar_valores_guia: false,
  bloquear_recaudo: false,
  invertir_origen_destino: false,
  permite_cambiar_adquiriente: false,
  bloquear_adquiriente_credito: false,
  bloquear_operacion_cliente: false,
  estado_recogido: true,
  estado_ingreso: true,
};

/** Textos de cada permiso en el diálogo de configuración, en el orden en que se muestran. */
export const PERMISOS_GUIA: readonly { campo: PermisoGuia; label: string; hint: string }[] = [
  {
    campo: 'cambiar_valores_guia',
    label: 'Cambiar valores de la guía',
    hint: 'Puede ajustar el flete y el manejo liquidados.',
  },
  {
    campo: 'bloquear_recaudo',
    label: 'Bloquear recaudo',
    hint: 'El recaudo queda en 0 y no lo puede editar.',
  },
  {
    campo: 'invertir_origen_destino',
    label: 'Invertir origen y destino',
    hint: 'Las condiciones se consultan con el trayecto al revés.',
  },
  {
    campo: 'permite_cambiar_adquiriente',
    label: 'Cambiar adquiriente',
    hint: 'Puede elegir otro adquiriente para la factura electrónica.',
  },
  {
    campo: 'bloquear_adquiriente_credito',
    label: 'Bloquear adquiriente en crédito',
    hint: 'En las guías a crédito el adquiriente es siempre su cliente.',
  },
  {
    campo: 'bloquear_operacion_cliente',
    label: 'Bloquear operación del cliente',
    hint: 'La operación del cliente queda fija en la configurada.',
  },
  {
    campo: 'estado_recogido',
    label: 'Guías recogidas',
    hint: 'Sus guías se crean con estado recogido.',
  },
  {
    campo: 'estado_ingreso',
    label: 'Guías ingresadas',
    hint: 'Sus guías se crean con estado ingresado.',
  },
];

/** Configuración del usuario en la empresa (`GET /mas/user-tenant-configuracion/{id}`). */
export interface UsuarioTenantConfiguracion extends Record<PermisoGuia, boolean> {
  user_tenant_id: number;
  /** Operación de `tte_operacion` por la que ingresan sus guías. */
  codigo_operacion_fk: string | null;
  /** Operación del cliente que se selecciona por defecto al crear una guía. */
  codigo_tercero_operacion_fk: number | null;
  /** Ciudad de origen de sus guías; sin ella se usa la de su operación. */
  codigo_ciudad_origen_fk: string | null;
}

/**
 * Cuerpo de `PATCH /mas/user-tenant-configuracion/{id}/actualizar`. Solo se cambian
 * los campos enviados; en los códigos `null` los limpia y los permisos no aceptan `null`.
 */
export type UsuarioTenantConfiguracionUpdateRequest = Partial<
  Omit<UsuarioTenantConfiguracion, 'user_tenant_id'>
>;
