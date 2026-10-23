# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Serve an app (dev server at http://localhost:4200 with proxy)
npx nx serve empleado
npx nx serve erp

# Serve against the local backend (http://localhost:8000) instead of staging
npx nx serve empleado --proxy-config=apps/empleado/proxy.conf.local.json
npx nx serve erp --proxy-config=apps/erp/proxy.conf.local.json

# Build
npx nx build empleado                        # Production build
npx nx build empleado --configuration=staging # Staging build
npx nx build erp

# Build/test only what changed
npx nx affected -t build
npx nx affected -t test
npx nx affected -t lint

# Build/test everything
npx nx run-many -t build
npx nx run-many -t test

# Lint & format
npx nx lint empleado
npx nx lint erp
npx prettier --check "**/*.{ts,html,scss,json}"

# Show project dependency graph
npx nx graph
```

All commands run from the monorepo root. Never use `ng serve` or `ng build` directly.

Prettier is configured in `.prettierrc.json` (printWidth 100, singleQuote, angular HTML parser). ESLint with angular-eslint + prettier. Husky runs lint-staged on pre-commit and commitlint on commit-msg.

## Architecture

**Stack**: Angular 20 (standalone components, signals) + PrimeNG 20.4.0 + SemanticaPreset (extends Aura with navy/sky brand palette) + Nx 21.6.10 monorepo.

### Monorepo structure

```
apps/
  empleado/     — Employee HR portal (pagos, reclamos, turnos, etc.)
  erp/          — API keys & security admin (api-keys, formatos)
libs/
  core/         — @semantica/core (guards, interceptors, services, utils, BaseAuthService)
  ui/           — @semantica/ui (shared UI components)
  styles/       — @semantica/styles (global SCSS partials)
```

### Shared libraries

**`@semantica/core`** (`libs/core/`):

- `tokens.ts` — injection tokens: `ENVIRONMENT`, `ROUTE_PATHS`, `AUTH_SERVICE`, `AUTH_SKIP_URLS`
- `guards/` — `authGuard`, `publicGuard` (use injection tokens, not direct service imports)
- `interceptors/` — `authInterceptor` (adds `withCredentials`), `errorInterceptor` + `error-handlers` (401 refresh, 403, 429, 500+)
- `services/` — `ToastService` (PrimeNG MessageService wrapper), `TokenRefreshService` (refresh queue)
- `auth/base-auth.service.ts` — abstract `BaseAuthService<TUser>` with shared methods (login, me, refresh, logout, forgotPassword, resetPassword, etc.)
- `utils/error.utils.ts` — `parseApiError`, `extractErrorMessage`, `ApiError`, `ApiErrorResponse`
- `models/auth.model.ts` — `BaseUsuario`, `LoginRequest`, `AuthResponse`, `ResendVerificationRequest`

**`@semantica/ui`** (`libs/ui/`):

- `EmptyStateComponent` — icon-wrap + title + message + ng-content
- `ErrorAlertComponent` — PrimeNG error message + retry button
- `LoadingSpinnerComponent` — PrimeNG progress spinner + message
- `PageHeaderComponent` — title + optional icon + subtitle + actions slot
- `TurnstileComponent` — Cloudflare Turnstile CAPTCHA (uses `ENVIRONMENT` token)

**`@semantica/styles`** (`libs/styles/`):

- `_fonts.scss` — Geist font-face declarations
- `_variables.scss` — CSS custom properties (brand palette)
- `_base.scss` — box-sizing reset, body styles
- `_components.scss` — `.page-container`, `.card`, `.table-card`, `.form-error`
- `_utilities.scss` — `.w-full`, `.mb-4`, `.mt-2`, `.text-truncate`

### App-specific code (stays in each app)

- `core/constants/api-endpoints.constants.ts` — API endpoints propios
- `core/constants/route-paths.constants.ts` — rutas propias
- `features/auth/services/auth.service.ts` — extiende `BaseAuthService<Usuario>` con métodos propios
- `features/auth/models/auth.model.ts` — `Usuario` extiende `BaseUsuario` con campos propios
- `app.config.ts` — provee injection tokens (`ENVIRONMENT`, `ROUTE_PATHS`, `AUTH_SERVICE`, `AUTH_SKIP_URLS`)
- Todos los feature modules

### Dependency graph

```
empleado  → @semantica/core, @semantica/ui
erp       → @semantica/core, @semantica/ui
ui        → @semantica/core (solo para ENVIRONMENT token en Turnstile)
```

### Auth pattern

Each app's `AuthService` extends `BaseAuthService<TUser>` from `@semantica/core`:
- Empleado adds: `register()`, `asociarEmpresa()`, `hasTenant` computed
- ERP adds: `forceLogout()`, overrides `logout()`

Injection tokens connect shared libs to app-specific code:
```typescript
// In app.config.ts
{ provide: ENVIRONMENT, useValue: environment },
{ provide: ROUTE_PATHS, useValue: { auth: { login: '/auth/login' }, dashboard: { root: '/dashboard' } } },
{ provide: AUTH_SERVICE, useExisting: AuthService },
{ provide: AUTH_SKIP_URLS, useValue: [API_ENDPOINTS.auth.login, ...] },
```

### Error handling

Centralized in `errorInterceptor` from `@semantica/core`:
- Status 0: toast "Error de conexión"
- 401: automatic token refresh via `TokenRefreshService` queue pattern; retries original request
- 403: toast "Acceso denegado" (skips if `is_verified === false`)
- 429: warning toast "Demasiadas solicitudes"
- 500+: toast "Error del servidor"
- 400/422: NOT auto-handled — components must show validation errors manually

**No duplicar toasts de error en componentes** — el interceptor ya maneja 0, 403, 429, 500+. Solo usar `toastService.error()` para errores 400/422 con mensajes de validación específicos. Los toasts de éxito sí van en los componentes.

### Authentication

HTTP-only cookies gestionadas por el backend. El `authInterceptor` agrega `withCredentials: true` a cada request al API. El `errorInterceptor` ante un 401 intenta refresh automático; si falla, cierra sesión. Se usa un patrón de cola con `BehaviorSubject` para que múltiples requests concurrentes con 401 solo disparen un único refresh.

### Environment

`src/environments/environment.ts` sets `apiUrl: '/api'` (proxied via `proxy.conf.json` in dev). Production uses `https://api.semanticaapi.com.co`, staging uses `https://api.semanticaapi.uk`.

## Commits

Husky ejecuta commitlint (`@commitlint/config-conventional`) en cada commit. Reglas clave:

- **header** (primera línea): máximo 100 caracteres, formato `type(scope): descripción`
- **types permitidos**: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`, `revert`
- **subject-case**: no usar Start Case, PascalCase ni UPPER CASE
- **body**: cada línea del body debe tener máximo 100 caracteres (regla `body-max-line-length`)
- **footer**: cada línea del footer debe tener máximo 100 caracteres

Al redactar el body, partir líneas largas antes de llegar a 100 caracteres. Esto aplica también a bullet points con `-`.

## Conventions

- All components are standalone; import PrimeNG modules directly in the component's `imports` array
- Use Angular signals (`signal`, `computed`) for local state; avoid `BehaviorSubject` for new code
- Use `inject()` inside the class body instead of constructor injection
- New feature routes go in a `<feature>.routes.ts` file and are lazy-loaded via `loadChildren` or `loadComponent`
- SCSS uses PrimeNG design tokens (`var(--p-surface-0)`, `var(--p-primary-color)`, etc.) for theming — avoid hardcoded colours
- Shared code goes in `libs/`; app-specific code stays in `apps/<app>/`
- Import shared code via `@semantica/core` or `@semantica/ui`, not relative paths to libs/

## Guidelines

- IMPORTANTE: Siempre piensa en el responsive design ya que es de suma importancia
- Siempre usa buenas prácticas de programación
- Necesito que cuando crees textos no los pongas asi "Prueba para Ejemplo" sino "Prueba para ejemplo", etc.
- Escribe código limpio y mantenible
- Documenta el código de forma clara y concisa
- Sigue las convenciones del proyecto para la arquitectura y estructura de archivos
- Usa el mcp de context7 en caso de necesitar información adicional tanto para la version de angular como primeng
