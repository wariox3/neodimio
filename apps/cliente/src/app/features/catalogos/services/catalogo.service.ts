import { Injectable, inject } from '@angular/core';
import { EMPTY, Observable, map, of, shareReplay, switchMap } from 'rxjs';
import {
  ActiveTenantService,
  API_ENDPOINTS,
  BaseHttpService,
  PaginatedResponse,
} from '../../../core';
import { MembresiaClienteService } from '../../contenedores/services/membresia-cliente.service';
import {
  Ciudad,
  ConfiguracionUsuario,
  FormatoImpresion,
  GuiaTipo,
  Identificacion,
  Operacion,
  Servicio,
  Tercero,
  TerceroOperacion,
  TerceroProducto,
  TipoImpresion,
} from '../models/catalogo.model';

/** Máximo de `size` que admite `/tte/tercero-operacion/lista`. */
const MAX_OPERACIONES_TERCERO = 200;

/** Tamaño de página suficiente para traer en una consulta los productos de un tercero. */
const MAX_PRODUCTOS_TERCERO = 500;

/**
 * Catálogos de fluor, compartidos por las pantallas de transporte.
 *
 * Son datos que casi no cambian (ciudades, tipos…), así que se piden una sola vez
 * por empresa. El caché va por empresa porque cada una tiene su propia base; ante
 * un error `shareReplay` no guarda nada y la siguiente suscripción reintenta.
 * Vive en memoria: recargar la página vuelve a consultar los datos.
 */
@Injectable({ providedIn: 'root' })
export class CatalogoService extends BaseHttpService {
  private readonly activeTenant = inject(ActiveTenantService);
  private readonly membresiaCliente = inject(MembresiaClienteService);
  private readonly cache = new Map<string, Observable<unknown>>();

  /** Tercero de la membresía del usuario; `membresiaClienteGuard` garantiza que exista. */
  tercero(): Observable<Tercero> {
    const clienteId = this.membresiaCliente.clienteId();
    if (clienteId === null) return EMPTY;
    return this.cachear<Tercero>(API_ENDPOINTS.tercero.detalle(clienteId));
  }

  ciudades(): Observable<Ciudad[]> {
    return this.cachear<Ciudad[]>(API_ENDPOINTS.catalogo.ciudades);
  }

  guiaTipos(): Observable<GuiaTipo[]> {
    return this.cachear<GuiaTipo[]>(API_ENDPOINTS.catalogo.guiaTipos);
  }

  /** Configuración del usuario en la empresa activa; el id de membresía es único por empresa. */
  configuracion(): Observable<ConfiguracionUsuario> {
    const membresiaId = this.membresiaCliente.membresiaId();
    if (membresiaId === null) return EMPTY;
    return this.cachear<ConfiguracionUsuario>(
      API_ENDPOINTS.userTenantConfiguracion.detalle(membresiaId),
    );
  }

  /**
   * Ciudad de origen de las guías del usuario, igual que en terbio: la de su configuración
   * y, si no tiene, la de su operación. `null` si no tiene ninguna de las dos.
   */
  ciudadOrigen(): Observable<string | null> {
    return this.configuracion().pipe(
      switchMap(({ codigo_ciudad_origen_fk: ciudad, codigo_operacion_fk: operacion }) => {
        if (ciudad) return of(ciudad);
        if (!operacion) return of(null);
        return this.cachear<Operacion>(API_ENDPOINTS.operacion.detalle(operacion)).pipe(
          map((o) => o.codigo_ciudad_fk),
        );
      }),
    );
  }

  /** Operaciones del tercero de la membresía, para el filtro de la lista y la guía nueva. */
  operacionesTercero(): Observable<TerceroOperacion[]> {
    const clienteId = this.membresiaCliente.clienteId();
    if (clienteId === null) return EMPTY;
    return this.cachear<PaginatedResponse<TerceroOperacion>>(API_ENDPOINTS.terceroOperacion.lista, {
      codigo_tercero_fk: String(clienteId),
      page: '1',
      size: String(MAX_OPERACIONES_TERCERO),
    }).pipe(map((res) => res.items));
  }

  /** Productos habilitados para el tercero de la membresía del usuario. */
  productosTercero(): Observable<TerceroProducto[]> {
    const clienteId = this.membresiaCliente.clienteId();
    if (clienteId === null) return EMPTY;
    return this.cachear<PaginatedResponse<TerceroProducto>>(API_ENDPOINTS.terceroProducto.buscar, {
      codigo_tercero_fk: String(clienteId),
      page: '1',
      size: String(MAX_PRODUCTOS_TERCERO),
    }).pipe(map((res) => res.items));
  }

  servicios(): Observable<Servicio[]> {
    return this.cachear<Servicio[]>(API_ENDPOINTS.catalogo.servicios);
  }

  identificaciones(): Observable<Identificacion[]> {
    return this.cachear<Identificacion[]>(API_ENDPOINTS.catalogo.identificaciones);
  }

  formatosImpresion(tipo: TipoImpresion): Observable<FormatoImpresion[]> {
    return this.cachear<FormatoImpresion[]>(API_ENDPOINTS.guia.formatosImpresion, { tipo });
  }

  /** Olvida lo consultado; se llama al cerrar sesión porque incluye datos del cliente. */
  limpiar(): void {
    this.cache.clear();
  }

  private cachear<T>(path: string, params?: Record<string, string>): Observable<T> {
    const clave = `${this.activeTenant.tenantId()}|${path}|${JSON.stringify(params ?? {})}`;
    let peticion = this.cache.get(clave) as Observable<T> | undefined;
    if (!peticion) {
      peticion = this.get<T>(path, params).pipe(shareReplay(1));
      this.cache.set(clave, peticion);
    }
    return peticion;
  }
}
