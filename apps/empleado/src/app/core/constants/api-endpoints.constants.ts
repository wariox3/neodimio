const AUTH = '/auth/seguridad';

export const API_ENDPOINTS = {
  auth: {
    login: `${AUTH}/login`,
    logout: `${AUTH}/logout`,
    refresh: `${AUTH}/refresh`,
    me: `${AUTH}/me`,
    forgotPassword: '/auth/user/recuperar-clave',
    resetPassword: '/auth/user/restablecer-clave',
    register: '/auth/user/registrar',
    verifyEmail: '/auth/user/verificar',
    resendVerification: '/auth/user/reenviar-verificacion',
  },
  tenant: {
    buscar: '/mas/tenant/seleccionar',
  },
  userTenant: {
    asociar: '/mas/user-tenant/asociar',
  },
} as const;
