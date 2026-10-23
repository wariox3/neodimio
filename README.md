# Semantica Monorepo

Monorepo para las aplicaciones frontend de Semantica, construido con **Angular 20**, **PrimeNG 20** y **Nx 21**.

## Aplicaciones

| App | Descripcion | Puerto |
| --- | --- | --- |
| **Empleado** | Portal de empleados (pagos, turnos, reclamos, certificados, etc.) | `4200` |
| **ERP** | Administracion de API keys y seguridad | `4200` |

## Estructura del proyecto

```
apps/
  empleado/         — Portal de empleados
  erp/              — Admin de seguridad
libs/
  core/             — @semantica/core (guards, interceptors, servicios, utilidades)
  ui/               — @semantica/ui (componentes compartidos)
  styles/           — @semantica/styles (SCSS globales)
```

## Requisitos previos

- **Node.js** >= 20
- **npm** >= 10

## Instalacion

```bash
git clone <repo-url>
cd semantica-monorepo
npm install
```

## Comandos principales

### Desarrollo

```bash
# Servir una app (dev server con proxy en http://localhost:4200)
npx nx serve empleado
npx nx serve erp

# Servir contra el backend local (http://localhost:8000) en vez de staging
npx nx serve empleado --proxy-config=apps/empleado/proxy.conf.local.json
npx nx serve erp --proxy-config=apps/erp/proxy.conf.local.json
```

### Build

```bash
# Build de produccion
npx nx build empleado
npx nx build erp

# Build de staging
npx nx build empleado --configuration=staging

# Build solo lo que cambio
npx nx affected -t build

# Build de todo
npx nx run-many -t build
```

### Lint y formato

```bash
# Lint por app
npx nx lint empleado
npx nx lint erp

# Lint de todo lo afectado
npx nx affected -t lint

# Verificar formato con Prettier
npx prettier --check "**/*.{ts,html,scss,json}"
```

### Tests

```bash
# Tests por app
npx nx test empleado
npx nx test erp

# Tests de lo afectado
npx nx affected -t test
```

### Utilidades

```bash
# Grafo de dependencias
npx nx graph
```

## Librerias compartidas

### `@semantica/core`

Logica compartida entre aplicaciones:

- **Tokens** — `ENVIRONMENT`, `ROUTE_PATHS`, `AUTH_SERVICE`, `AUTH_SKIP_URLS`
- **Guards** — `authGuard`, `publicGuard`
- **Interceptors** — `authInterceptor` (credentials), `errorInterceptor` (manejo centralizado de errores HTTP)
- **Servicios** — `ToastService`, `TokenRefreshService`
- **Auth** — `BaseAuthService<TUser>` (clase abstracta que cada app extiende)
- **Utilidades** — `parseApiError`, `extractErrorMessage`

### `@semantica/ui`

Componentes UI reutilizables:

- `EmptyStateComponent` — Estado vacio con icono y mensaje
- `ErrorAlertComponent` — Alerta de error con boton de reintentar
- `LoadingSpinnerComponent` — Spinner de carga
- `PageHeaderComponent` — Header de pagina con titulo, subtitulo y acciones
- `TurnstileComponent` — Cloudflare Turnstile CAPTCHA

### `@semantica/styles`

Estilos SCSS globales:

- `_fonts.scss` — Fuente Geist
- `_variables.scss` — Custom properties (paleta navy/sky)
- `_base.scss` — Reset y estilos base
- `_components.scss` — Clases utilitarias de componentes (`.page-container`, `.card`, `.table-card`)
- `_utilities.scss` — Helpers (`.w-full`, `.mb-4`, `.text-truncate`)

## Grafo de dependencias

```
empleado  → @semantica/core, @semantica/ui
erp       → @semantica/core, @semantica/ui
ui        → @semantica/core
```

## Entornos

| Entorno | API URL | Branch |
| --- | --- | --- |
| Desarrollo | `/api` (proxy a staging API) | `dev` |
| Staging | `https://api.semanticaapi.uk` | `dev` |
| Produccion | `https://api.semanticaapi.com.co` | `main` |

## Convenciones

- **Standalone components** — sin NgModules, importar PrimeNG directamente en `imports`
- **Signals** — usar `signal()` y `computed()` para estado local
- **inject()** — en el cuerpo de la clase, no inyeccion por constructor
- **Lazy loading** — rutas en archivos `<feature>.routes.ts` con `loadChildren`/`loadComponent`
- **Design tokens** — usar variables de PrimeNG (`var(--p-surface-0)`, `var(--p-primary-color)`) en lugar de colores hardcodeados
- **Imports** — usar `@semantica/core` y `@semantica/ui`, nunca rutas relativas a `libs/`
- **Responsive design** — todas las vistas deben ser responsivas

## Commits

El proyecto usa [Conventional Commits](https://www.conventionalcommits.org/) con las siguientes reglas:

- **Tipos**: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`, `revert`
- **Formato**: `tipo(scope): descripcion` (max 100 caracteres)
- Husky ejecuta `lint-staged` en pre-commit y `commitlint` en commit-msg

## CI/CD

El pipeline de GitHub Actions ejecuta:

1. **CI** — lint y build de proyectos afectados en cada PR
2. **Commitlint** — validacion de mensajes de commit
3. **Deploy** — build y despliegue automatico via rsync sobre SSH
   - Push a `dev` → build staging → deploy a servidor de desarrollo
   - Push a `main` → build produccion → deploy a servidor de produccion

## Stack tecnologico

| Tecnologia | Version |
| --- | --- |
| Angular | 20 |
| PrimeNG | 20.4.0 |
| Nx | 21.6.10 |
| TypeScript | 5.9 |
| RxJS | 7.8 |
| Node.js | >= 20 |
