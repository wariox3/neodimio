// Tokens
export {
  ENVIRONMENT,
  ROUTE_PATHS,
  AUTH_SERVICE,
  AUTH_SKIP_URLS,
  type SemanticaEnvironment,
  type RoutePaths,
  type AuthServiceContract,
} from './lib/tokens';

// Guards
export { authGuard } from './lib/guards/auth.guard';
export { publicGuard } from './lib/guards/public.guard';
export { roleGuard } from './lib/guards/role.guard';

// Interceptors
export { authInterceptor } from './lib/interceptors/auth.interceptor';
export { errorInterceptor } from './lib/interceptors/error.interceptor';

// Services
export {
  BaseHttpService,
  buildHttpParams,
  type ParamValue,
} from './lib/services/base-http.service';
export { ToastService } from './lib/services/toast.service';
export { TokenRefreshService } from './lib/services/token-refresh.service';
export { FicherosService } from './lib/services/ficheros.service';

// Models
export {
  type BaseUsuario,
  type LoginRequest,
  type AuthResponse,
  type ResendVerificationRequest,
} from './lib/models/auth.model';
export { type Fichero } from './lib/models/fichero.model';

// Utils
export {
  extractErrorMessage,
  parseApiError,
  type ApiError,
  type ApiErrorResponse,
} from './lib/utils/error.utils';
export { MESES_ES, getMesAnioLabel, getSiguienteMes } from './lib/utils/date.utils';
export { downloadBlob } from './lib/utils/download.utils';
export { createCooldown, type CooldownController } from './lib/utils/cooldown.util';
export { trimFormValues, type TrimFormValuesOptions } from './lib/utils/form.utils';

// Pipes
export { TruncatePipe } from './lib/pipes/truncate.pipe';

// Validators
export { dateRangeValidator } from './lib/validators/date-range.validator';

// Auth
export { BaseAuthService, type AuthApiEndpoints } from './lib/auth/base-auth.service';
