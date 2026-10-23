export const ROUTE_PATHS = {
  auth: {
    login: '/auth/login',
    verifyEmail: '/auth/verify-email',
    resendVerification: '/auth/resend-verification',
    forgotPassword: '/auth/forgot-password',
    resetPassword: '/auth/restablecer-clave',
  },
  dashboard: {
    root: '/dashboard',
    inicio: '/dashboard/inicio',
    apiKeys: '/dashboard/seguridad/api-keys',
    formatos: '/dashboard/formato/lista',
  },
} as const;
