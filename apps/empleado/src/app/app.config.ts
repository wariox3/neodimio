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
import { definePreset, palette } from '@primeuix/themes';
import Aura from '@primeng/themes/aura';

const SemanticaPreset = definePreset(Aura, {
  primitive: {
    navy: palette('#143049'),
    sky: palette('#77aad7'),
  },
  semantic: {
    primary: {
      50: '{navy.50}',
      100: '{navy.100}',
      200: '{navy.200}',
      300: '{navy.300}',
      400: '{navy.400}',
      500: '{navy.500}',
      600: '{navy.600}',
      700: '{navy.700}',
      800: '{navy.800}',
      900: '{navy.900}',
      950: '{navy.950}',
    },
    colorScheme: {
      light: {
        primary: {
          color: '{navy.500}',
          inverseColor: '#ffffff',
          hoverColor: '{navy.600}',
          activeColor: '{navy.700}',
        },
        highlight: {
          background: '{navy.50}',
          focusBackground: '{navy.100}',
          color: '{navy.700}',
          focusColor: '{navy.800}',
        },
      },
      dark: {
        primary: {
          color: '{sky.400}',
          inverseColor: '{navy.950}',
          hoverColor: '{sky.300}',
          activeColor: '{sky.200}',
        },
        highlight: {
          background: 'rgba(119, 170, 215, 0.16)',
          focusBackground: 'rgba(119, 170, 215, 0.24)',
          color: 'rgba(255, 255, 255, 0.87)',
          focusColor: 'rgba(255, 255, 255, 0.87)',
        },
      },
    },
  },
});

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
    provideHttpClient(withInterceptors([authInterceptor, errorInterceptor])),
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
        API_ENDPOINTS.auth.asociarEmpresa,
      ],
    },
    provideAppInitializer(() => {
      const auth = inject(AuthService);
      return firstValueFrom(auth.me()).catch(() => null);
    }),
    provideAnimationsAsync(),
    providePrimeNG({
      theme: {
        preset: SemanticaPreset,
        options: { darkModeSelector: '.dark-mode' },
      },
    }),
  ],
};
