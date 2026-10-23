// Re-export shared core
export {
  authGuard,
  publicGuard,
  authInterceptor,
  errorInterceptor,
  ToastService,
  TokenRefreshService,
  BaseAuthService,
  BaseHttpService,
  buildHttpParams,
  extractErrorMessage,
  parseApiError,
  ENVIRONMENT,
  ROUTE_PATHS as ROUTE_PATHS_TOKEN,
  AUTH_SERVICE,
  AUTH_SKIP_URLS,
} from '@semantica/core';
export type {
  ApiError,
  ApiErrorResponse,
  BaseUsuario,
  AuthServiceContract,
  AuthApiEndpoints,
  SemanticaEnvironment,
  RoutePaths,
  LoginRequest,
  AuthResponse,
  ResendVerificationRequest,
  ParamValue,
} from '@semantica/core';

// App-specific exports
export { tenantGuard } from './guards/tenant.guard';
export type { PaginatedResponse, BaseQueryParams } from './models/pagination.model';
export { API_ENDPOINTS } from './constants/api-endpoints.constants';
export { ROUTE_PATHS } from './constants/route-paths.constants';
