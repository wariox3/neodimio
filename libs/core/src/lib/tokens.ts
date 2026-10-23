import { InjectionToken, Signal } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseUsuario } from './models/auth.model';

export interface SemanticaEnvironment {
  apiUrl: string;
  marketingApiUrl: string;
  turnstileSiteKey: string;
  whatsappPhone: string;
}

export interface RoutePaths {
  auth: { login: string };
  dashboard: { root: string };
}

export interface AuthServiceContract {
  isAuthenticated: () => boolean;
  currentUser: Signal<BaseUsuario | null>;
  refresh: () => Observable<unknown>;
  clearSession: () => void;
}

export const ENVIRONMENT = new InjectionToken<SemanticaEnvironment>('SemanticaEnvironment');
export const ROUTE_PATHS = new InjectionToken<RoutePaths>('RoutePaths');
export const AUTH_SERVICE = new InjectionToken<AuthServiceContract>('AuthService');
export const AUTH_SKIP_URLS = new InjectionToken<string[]>('AuthSkipUrls');

/** Ruta de la pantalla de selección de empresa (usada por `activeTenantGuard`). */
export const TENANT_SELECTION_PATH = new InjectionToken<string>('TenantSelectionPath');
