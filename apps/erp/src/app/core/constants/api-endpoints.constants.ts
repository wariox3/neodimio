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
  apiKey: {
    list: '/auth/api-key/lista',
    create: '/auth/api-key/nuevo',
    byId: (id: number) => `/auth/api-key/eliminar/${id}`,
  },
  user: {
    list: `${USER}/lista`,
    create: `${USER}/nuevo`,
  },
  tenant: {
    buscar: '/auth/tenant/seleccionar',
  },
  formato: {
    list: '/gen/formato/lista',
    byId: (id: number) => `/gen/formato/${id}`,
    updateContenido: (id: number) => `/gen/formato/${id}/contenido`,
  },
  formatoImagen: {
    list: '/gen/formato-imagen/lista-actualizar',
    create: '/gen/formato-imagen/nuevo',
    update: (id: number) => `/gen/formato-imagen/${id}/actualizar`,
    delete: (id: number) => `/gen/formato-imagen/${id}/eliminar`,
  },
} as const;
