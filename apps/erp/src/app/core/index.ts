// Re-export shared core
export {
  authGuard,
  publicGuard,
  roleGuard,
  authInterceptor,
  errorInterceptor,
  ToastService,
  TokenRefreshService,
  BaseAuthService,
  BaseHttpService,
  buildHttpParams,
  createCooldown,
  extractErrorMessage,
  parseApiError,
  ENVIRONMENT,
  ROUTE_PATHS as ROUTE_PATHS_TOKEN,
  AUTH_SERVICE,
  AUTH_SKIP_URLS,
  TENANT_SELECTION_PATH,
  tenantInterceptor,
  ActiveTenantService,
  activeTenantGuard,
} from '@semantica/core';
export type {
  ApiError,
  ApiErrorResponse,
  CooldownController,
  BaseUsuario,
  AuthServiceContract,
  AuthApiEndpoints,
  SemanticaEnvironment,
  RoutePaths,
  LoginRequest,
  AuthResponse,
  ResendVerificationRequest,
  ParamValue,
  ActiveTenant,
} from '@semantica/core';

// App-specific exports
export type { PaginatedResponse, QueryParams } from './models/pagination.model';
export { API_ENDPOINTS } from './constants/api-endpoints.constants';
export { ROUTE_PATHS } from './constants/route-paths.constants';
export { isSafeReturnUrl } from './utils/url.utils';
