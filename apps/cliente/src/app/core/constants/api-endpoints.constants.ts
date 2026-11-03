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
    detalle: (id: number) => `/tte/guia/detalle/${id}`,
    formatosImpresion: '/tte/guia/formatos-impresion',
    imprimirGuia: '/tte/guia/imprimir-guia',
    imprimirRotulo: '/tte/guia/imprimir-rotulo',
    liquidar: '/tte/guia/liquidar',
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
  catalogo: {
    ciudades: '/tte/ciudad/descargar',
    guiaTipos: '/tte/guia-tipo/descargar',
    servicios: '/tte/servicio/descargar',
    identificaciones: '/gen/identificacion/descargar',
  },
} as const;
