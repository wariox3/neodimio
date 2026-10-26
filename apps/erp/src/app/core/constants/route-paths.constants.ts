export const ROUTE_PATHS = {
  auth: {
    login: '/auth/login',
    verifyEmail: '/auth/verify-email',
    resendVerification: '/auth/resend-verification',
    forgotPassword: '/auth/forgot-password',
    resetPassword: '/auth/restablecer-clave',
    register: '/auth/register',
  },
  contenedores: {
    root: '/contenedores',
  },
  dashboard: {
    root: '/dashboard',
    inicio: '/dashboard/inicio',
    empresa: '/dashboard/empresa',
    seguridad: {
      root: '/dashboard/seguridad',
      usuarios: '/dashboard/seguridad/usuarios/lista',
      invitaciones: '/dashboard/seguridad/invitaciones/lista',
      apiKeys: '/dashboard/seguridad/api-keys',
    },
    configuracion: {
      root: '/dashboard/configuracion',
      formatos: '/dashboard/configuracion/formato/lista',
      formatoEditar: (id: number) => `/dashboard/configuracion/formato/editar/${id}`,
    },
  },
} as const;
