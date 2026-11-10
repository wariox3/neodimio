const AUTH = '/auth/seguridad';
const USER = '/auth/user';

export const API_ENDPOINTS = {
  auth: {
    login: `${AUTH}/login`,
    logout: `${AUTH}/logout`,
    refresh: `${AUTH}/refresh`,
    me: `${AUTH}/me`,
    verifyEmail: `${USER}/verificar`,
    resendVerification: `${USER}/reenviar-verificacion`,
    forgotPassword: `${USER}/recuperar-clave`,
    resetPassword: `${USER}/restablecer-clave`,
  },
  userTenant: {
    lista: '/mas/user-tenant/lista',
  },
  userTenantConfiguracion: {
    detalle: (id: number) => `/mas/user-tenant-configuracion/${id}`,
  },
  guia: {
    lista: '/tte/guia/lista',
    nuevo: '/tte/guia/nuevo',
    detalle: (id: number) => `/tte/guia/detalle/${id}`,
    formatosImpresion: '/tte/guia/formatos-impresion',
    imprimirGuia: '/tte/guia/imprimir-guia',
    imprimirRotulo: '/tte/guia/imprimir-rotulo',
    condicionEspecial: '/tte/guia/condicion-especial',
  },
  operacion: {
    detalle: (codigo: string) => `/tte/operacion/detalle/${encodeURIComponent(codigo)}`,
  },
  novedad: {
    lista: '/tte/novedad/lista',
  },
  destinatario: {
    lista: '/tte/destinatario/lista',
    nuevo: '/tte/destinatario/nuevo',
    detalle: (id: number) => `/tte/destinatario/detalle/${id}`,
  },
  tercero: {
    detalle: (id: number) => `/gen/tercero/detalle/${id}`,
    buscar: '/gen/tercero/buscar',
    nuevo: '/gen/tercero/nuevo',
  },
  terceroOperacion: {
    lista: '/tte/tercero-operacion/lista',
  },
  terceroProducto: {
    buscar: '/tte/tercero-producto/buscar',
  },
  despacho: {
    lista: '/tte/despacho/lista',
    deGuia: (guiaId: number) => `/tte/despacho-detalle/guia/${guiaId}`,
  },
  cartera: {
    pendientes: '/car/cuenta-cobrar/pendiente',
    movimientos: '/car/movimiento/lista',
  },
  consigna: {
    lista: '/tur/consigna/lista-cliente',
  },
  factura: {
    lista: '/tur/factura/lista',
  },
  programacion: {
    lista: '/tur/programacion/lista',
  },
  cotizacion: {
    lista: '/crm/cotizacion/lista-portal',
  },
  pqrs: {
    lista: '/crm/solicitud/lista-portal',
  },
  visita: {
    lista: '/crm/visita/lista-portal',
    detalle: (id: number) => `/crm/visita/detalle-portal/${id}`,
    imprimir: (id: number) => `/crm/visita/imprimir-portal/${id}`,
    archivos: (id: number) => `/crm/visita/${id}/archivos`,
    descargar: (id: number, archivoId: number) =>
      `/crm/visita/${id}/archivo/${archivoId}/descargar`,
  },
  seguridadSocial: {
    lista: '/rhu/aporte_contrato/lista-portal',
    archivos: (aporteContratoId: number) => `/rhu/aporte_contrato/${aporteContratoId}/archivos`,
    descargar: (aporteContratoId: number, archivoId: number) =>
      `/rhu/aporte_contrato/${aporteContratoId}/archivo/${archivoId}/descargar`,
  },
  catalogo: {
    ciudades: '/tte/ciudad/descargar',
    guiaTipos: '/tte/guia-tipo/descargar',
    servicios: '/tte/servicio/descargar',
    identificaciones: '/gen/identificacion/descargar',
    /** Ciudades de `gen_ciudad`, las que usa el tercero (código numérico). */
    ciudadesGenerales: '/gen/ciudad/descargar',
    configuracionGeneral: '/gen/configuracion/guia-nuevo',
  },
} as const;
