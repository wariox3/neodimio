import {
  ApplicationConfig,
  inject,
  provideAppInitializer,
  provideBrowserGlobalErrorListeners,
  provideZoneChangeDetection,
} from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { providePrimeNG } from 'primeng/config';
import { SEMANTICA_THEME } from '@semantica/core';

import { MessageService } from 'primeng/api';
import { firstValueFrom } from 'rxjs';
import { routes } from './app.routes';
import {
  authInterceptor,
  errorInterceptor,
  ENVIRONMENT,
  ROUTE_PATHS as ROUTE_PATHS_TOKEN,
  AUTH_SERVICE,
  AUTH_SKIP_URLS,
  tenantInterceptor,
} from '@semantica/core';
import { AuthService } from './features/auth/services/auth.service';
import { environment } from '../environments/environment';
import { ROUTE_PATHS } from './core/constants/route-paths.constants';
import { API_ENDPOINTS } from './core/constants/api-endpoints.constants';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes, withComponentInputBinding()),
    provideHttpClient(withInterceptors([authInterceptor, tenantInterceptor, errorInterceptor])),
    MessageService,
    { provide: ENVIRONMENT, useValue: environment },
    {
      provide: ROUTE_PATHS_TOKEN,
      useValue: {
        auth: { login: ROUTE_PATHS.auth.login },
        dashboard: { root: ROUTE_PATHS.dashboard.root },
      },
    },
    { provide: AUTH_SERVICE, useExisting: AuthService },
    {
      provide: AUTH_SKIP_URLS,
      useValue: [
        API_ENDPOINTS.auth.login,
        API_ENDPOINTS.auth.refresh,
        API_ENDPOINTS.auth.logout,
        API_ENDPOINTS.auth.me,
        API_ENDPOINTS.auth.forgotPassword,
        API_ENDPOINTS.auth.resetPassword,
        API_ENDPOINTS.auth.register,
      ],
    },
    provideAppInitializer(() => {
      const auth = inject(AuthService);
      return firstValueFrom(auth.me()).catch(() => null);
    }),
    provideAnimationsAsync(),
    providePrimeNG({
      theme: SEMANTICA_THEME,
    }),
  ],
};
