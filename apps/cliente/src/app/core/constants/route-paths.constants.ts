const DASHBOARD = '/dashboard';

export const ROUTE_PATHS = {
  auth: {
    login: '/auth/login',
    register: '/auth/register',
    forgotPassword: '/auth/forgot-password',
    resendVerification: '/auth/resend-verification',
  },
  contenedores: {
    root: '/contenedores',
  },
  dashboard: {
    root: DASHBOARD,
    inicio: `${DASHBOARD}/inicio`,
    general: {
      informacion: `${DASHBOARD}/general/informacion`,
    },
    crm: {
      visitas: `${DASHBOARD}/crm/visitas`,
      visitaDetalle: (id: number) => `${DASHBOARD}/crm/visitas/${id}`,
      cotizaciones: `${DASHBOARD}/crm/cotizaciones`,
      cotizacionNueva: `${DASHBOARD}/crm/cotizaciones/nueva`,
      cotizacionDetalle: (id: number) => `${DASHBOARD}/crm/cotizaciones/${id}`,
      pqrs: `${DASHBOARD}/crm/pqrs`,
      pqrsNueva: `${DASHBOARD}/crm/pqrs/nueva`,
      pqrsDetalle: (id: number) => `${DASHBOARD}/crm/pqrs/${id}`,
    },
    operacion: {
      consignas: `${DASHBOARD}/operacion/consignas`,
    },
    programacion: {
      empleados: `${DASHBOARD}/programacion/empleados`,
    },
    venta: {
      facturas: `${DASHBOARD}/venta/facturas`,
    },
    cartera: {
      pendientes: `${DASHBOARD}/cartera/pendientes`,
      recibos: `${DASHBOARD}/cartera/recibos`,
    },
    recursoHumano: {
      autorizacionArma: `${DASHBOARD}/recurso-humano/autorizacion-arma`,
      seguridadSocial: `${DASHBOARD}/recurso-humano/seguridad-social`,
    },
    transporte: {
      guias: `${DASHBOARD}/transporte/guias`,
      guiaNueva: `${DASHBOARD}/transporte/guias/nueva`,
      guiaDetalle: (id: number) => `${DASHBOARD}/transporte/guias/${id}`,
      novedades: `${DASHBOARD}/transporte/novedades`,
      destinatarios: `${DASHBOARD}/transporte/destinatarios`,
      destinatarioNuevo: `${DASHBOARD}/transporte/destinatarios/nuevo`,
      destinatarioEditar: (id: number) => `${DASHBOARD}/transporte/destinatarios/${id}`,
    },
    gestionLogistica: {
      despachos: `${DASHBOARD}/gestion-logistica/despachos`,
      soporte: `${DASHBOARD}/gestion-logistica/soporte`,
      redespacho: `${DASHBOARD}/gestion-logistica/redespacho`,
    },
  },
} as const;
