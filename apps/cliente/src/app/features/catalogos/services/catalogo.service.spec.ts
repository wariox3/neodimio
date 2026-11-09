import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ENVIRONMENT } from '@semantica/core';
import { MembresiaClienteService } from '../../contenedores/services/membresia-cliente.service';
import { Tercero } from '../models/catalogo.model';
import { CatalogoService } from './catalogo.service';

describe('Caché del tercero', () => {
  let http: HttpTestingController;
  let membresia: MembresiaClienteService;
  let service: CatalogoService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: ENVIRONMENT, useValue: { apiUrl: '/api' } },
      ],
    });
    http = TestBed.inject(HttpTestingController);
    membresia = TestBed.inject(MembresiaClienteService);
    service = TestBed.inject(CatalogoService);
  });

  afterEach(() => http.verify());

  it('consulta el tercero una sola vez y reutiliza la respuesta', () => {
    membresia.set(25);
    const recibidos: Tercero[] = [];

    service.tercero().subscribe((t) => recibidos.push(t));
    http.expectOne('/api/gen/tercero/detalle/25').flush({ codigo_tercero_pk: 25 });
    service.tercero().subscribe((t) => recibidos.push(t));

    expect(recibidos.map((t) => t.codigo_tercero_pk)).toEqual([25, 25]);
  });

  it('no reutiliza la respuesta de otro cliente', () => {
    membresia.set(25);
    service.tercero().subscribe();
    http.expectOne('/api/gen/tercero/detalle/25').flush({ codigo_tercero_pk: 25 });

    membresia.set(30);
    service.tercero().subscribe();
    http.expectOne('/api/gen/tercero/detalle/30').flush({ codigo_tercero_pk: 30 });
  });

  it('reintenta en la siguiente consulta si la anterior falló', () => {
    membresia.set(25);
    service.tercero().subscribe({ error: () => undefined });
    http
      .expectOne('/api/gen/tercero/detalle/25')
      .flush(null, { status: 500, statusText: 'Server Error' });

    service.tercero().subscribe();
    http.expectOne('/api/gen/tercero/detalle/25').flush({ codigo_tercero_pk: 25 });
  });

  it('vuelve a consultar después de limpiar el caché', () => {
    membresia.set(25);
    service.tercero().subscribe();
    http.expectOne('/api/gen/tercero/detalle/25').flush({ codigo_tercero_pk: 25 });

    service.limpiar();

    service.tercero().subscribe();
    http.expectOne('/api/gen/tercero/detalle/25').flush({ codigo_tercero_pk: 25 });
  });

  it('no consulta si no hay cliente en la membresía', () => {
    service.tercero().subscribe();
    http.expectNone('/api/gen/tercero/detalle/null');
  });
});

describe('Caché de los productos del tercero', () => {
  const URL = '/api/tte/tercero-producto/buscar';
  const respuesta = {
    total: 1,
    page: 1,
    size: 500,
    items: [{ codigo_producto_fk: '5', producto_nombre: 'CAJA' }],
  };
  let http: HttpTestingController;
  let membresia: MembresiaClienteService;
  let service: CatalogoService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: ENVIRONMENT, useValue: { apiUrl: '/api' } },
      ],
    });
    http = TestBed.inject(HttpTestingController);
    membresia = TestBed.inject(MembresiaClienteService);
    service = TestBed.inject(CatalogoService);
  });

  afterEach(() => http.verify());

  it('consulta una sola vez y devuelve los productos', () => {
    membresia.set(25);
    const recibidos: unknown[] = [];

    service.productosTercero().subscribe((p) => recibidos.push(p));
    const req = http.expectOne((r) => r.url === URL);
    expect(req.request.params.get('codigo_tercero_fk')).toBe('25');
    req.flush(respuesta);
    service.productosTercero().subscribe((p) => recibidos.push(p));

    expect(recibidos).toEqual([respuesta.items, respuesta.items]);
  });

  it('no reutiliza los productos de otro cliente', () => {
    membresia.set(25);
    service.productosTercero().subscribe();
    http.expectOne((r) => r.url === URL).flush(respuesta);

    membresia.set(30);
    service.productosTercero().subscribe();
    const req = http.expectOne((r) => r.url === URL);
    expect(req.request.params.get('codigo_tercero_fk')).toBe('30');
    req.flush(respuesta);
  });
});

describe('Caché de los tipos de guía', () => {
  it('consulta una sola vez aunque varias pantallas los pidan', () => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: ENVIRONMENT, useValue: { apiUrl: '/api' } },
      ],
    });
    const http = TestBed.inject(HttpTestingController);
    const service = TestBed.inject(CatalogoService);
    const tipos = [
      { codigo_guia_tipo_pk: 'COR', nombre: 'CREDITO', codigo_pago_fk: 'COR', validar_flete: true },
    ];
    const recibidos: unknown[] = [];

    service.guiaTipos().subscribe((t) => recibidos.push(t));
    http.expectOne('/api/tte/guia-tipo/descargar').flush(tipos);
    service.guiaTipos().subscribe((t) => recibidos.push(t));

    expect(recibidos).toEqual([tipos, tipos]);
    http.verify();
  });
});

describe('Caché de las operaciones del tercero', () => {
  const URL = '/api/tte/tercero-operacion/lista';
  const respuesta = {
    total: 1,
    page: 1,
    size: 200,
    items: [{ codigo_tercero_operacion_pk: 5, codigo: 'B1', nombre: 'Bodega' }],
  };
  let http: HttpTestingController;
  let membresia: MembresiaClienteService;
  let service: CatalogoService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: ENVIRONMENT, useValue: { apiUrl: '/api' } },
      ],
    });
    http = TestBed.inject(HttpTestingController);
    membresia = TestBed.inject(MembresiaClienteService);
    service = TestBed.inject(CatalogoService);
  });

  afterEach(() => http.verify());

  it('consulta una sola vez y devuelve las operaciones', () => {
    membresia.set(25);
    const recibidas: unknown[] = [];

    service.operacionesTercero().subscribe((o) => recibidas.push(o));
    const req = http.expectOne((r) => r.url === URL);
    expect(req.request.params.get('codigo_tercero_fk')).toBe('25');
    expect(req.request.params.get('size')).toBe('200');
    req.flush(respuesta);
    service.operacionesTercero().subscribe((o) => recibidas.push(o));

    expect(recibidas).toEqual([respuesta.items, respuesta.items]);
  });

  it('no reutiliza las operaciones de otro cliente', () => {
    membresia.set(25);
    service.operacionesTercero().subscribe();
    http.expectOne((r) => r.url === URL).flush(respuesta);

    membresia.set(30);
    service.operacionesTercero().subscribe();
    const req = http.expectOne((r) => r.url === URL);
    expect(req.request.params.get('codigo_tercero_fk')).toBe('30');
    req.flush(respuesta);
  });
});

describe('Caché de la configuración del usuario', () => {
  it('consulta una sola vez por membresía', () => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: ENVIRONMENT, useValue: { apiUrl: '/api' } },
      ],
    });
    const http = TestBed.inject(HttpTestingController);
    const membresia = TestBed.inject(MembresiaClienteService);
    const service = TestBed.inject(CatalogoService);
    const configuracion = {
      user_tenant_id: 9,
      codigo_operacion_fk: 'MED',
      codigo_tercero_operacion_fk: 5,
      codigo_ciudad_origen_fk: null,
    };
    const recibidas: unknown[] = [];

    membresia.set(25, 9);
    service.configuracion().subscribe((c) => recibidas.push(c));
    http.expectOne('/api/mas/user-tenant-configuracion/9').flush(configuracion);
    service.configuracion().subscribe((c) => recibidas.push(c));
    expect(recibidas).toEqual([configuracion, configuracion]);

    membresia.set(30, 12);
    service.configuracion().subscribe();
    http.expectOne('/api/mas/user-tenant-configuracion/12').flush(configuracion);
    http.verify();
  });

  it('vuelve a consultar después de refrescarla, sin perder los demás catálogos', () => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: ENVIRONMENT, useValue: { apiUrl: '/api' } },
      ],
    });
    const http = TestBed.inject(HttpTestingController);
    TestBed.inject(MembresiaClienteService).set(25, 9);
    const service = TestBed.inject(CatalogoService);

    service.configuracion().subscribe();
    http
      .expectOne('/api/mas/user-tenant-configuracion/9')
      .flush({ user_tenant_id: 9, cambiar_valores_guia: false });
    service.ciudades().subscribe();
    http.expectOne('/api/tte/ciudad/descargar').flush([]);

    service.refrescarConfiguracion();
    let recibida: unknown;
    service.configuracion().subscribe((c) => (recibida = c));
    http
      .expectOne('/api/mas/user-tenant-configuracion/9')
      .flush({ user_tenant_id: 9, cambiar_valores_guia: true });
    expect(recibida).toEqual({ user_tenant_id: 9, cambiar_valores_guia: true });

    service.ciudades().subscribe();
    http.verify();
  });
});

describe('Ciudad de origen del usuario', () => {
  const CONFIGURACION = '/api/mas/user-tenant-configuracion/9';
  let http: HttpTestingController;
  let service: CatalogoService;
  let recibido: string | null | undefined;

  const configuracion = (ciudad: string | null, operacion: string | null) => ({
    user_tenant_id: 9,
    codigo_operacion_fk: operacion,
    codigo_tercero_operacion_fk: null,
    codigo_ciudad_origen_fk: ciudad,
  });

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: ENVIRONMENT, useValue: { apiUrl: '/api' } },
      ],
    });
    http = TestBed.inject(HttpTestingController);
    TestBed.inject(MembresiaClienteService).set(25, 9);
    service = TestBed.inject(CatalogoService);
    recibido = undefined;
    service.ciudadOrigen().subscribe((c) => (recibido = c));
  });

  afterEach(() => http.verify());

  it('prefiere la ciudad de la configuración sin consultar la operación', () => {
    http.expectOne(CONFIGURACION).flush(configuracion('478', 'MED'));
    expect(recibido).toBe('478');
  });

  it('sin ciudad usa la de la operación y la deja en caché', () => {
    http.expectOne(CONFIGURACION).flush(configuracion(null, 'MED'));
    http
      .expectOne('/api/tte/operacion/detalle/MED')
      .flush({ codigo_operacion_pk: 'MED', nombre: 'MEDELLIN', codigo_ciudad_fk: '385' });
    expect(recibido).toBe('385');

    service.ciudadOrigen().subscribe((c) => (recibido = c));
    expect(recibido).toBe('385');
  });

  it('devuelve null si no tiene ciudad ni operación', () => {
    http.expectOne(CONFIGURACION).flush(configuracion(null, null));
    expect(recibido).toBeNull();
  });
});
