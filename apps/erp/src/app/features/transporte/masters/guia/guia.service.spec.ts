import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ENVIRONMENT } from '@semantica/core';
import { GuiaFiltros } from './guia.model';
import { GuiaService } from './guia.service';

describe('GuiaService', () => {
  let http: HttpTestingController;
  let service: GuiaService;
  const sinFiltros: GuiaFiltros = {
    fecha_desde: null,
    fecha_hasta: null,
    estado: null,
    codigo_guia_pk: null,
    documento_cliente: null,
  };
  const pedir = (filtros: Partial<GuiaFiltros>) => {
    service.listar(2, 25, { ...sinFiltros, ...filtros }).subscribe();
    return http.expectOne((r) => r.url === '/api/tte/guia/lista').request.params;
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: ENVIRONMENT, useValue: { apiUrl: '/api' } },
      ],
    });
    http = TestBed.inject(HttpTestingController);
    service = TestBed.inject(GuiaService);
  });

  afterEach(() => http.verify());

  it('envía la paginación y omite los filtros vacíos', () => {
    const params = pedir({});
    expect(params.keys().sort()).toEqual(['page', 'size']);
    expect(params.get('page')).toBe('2');
    expect(params.get('size')).toBe('25');
  });

  it('envía las fechas en día local, sin correrlas por la zona horaria', () => {
    const params = pedir({
      fecha_desde: new Date(2026, 10, 5, 23, 30),
      fecha_hasta: new Date(2026, 10, 6, 0, 15),
    });
    expect(params.get('fecha_desde')).toBe('2026-11-05');
    expect(params.get('fecha_hasta')).toBe('2026-11-06');
  });

  it('limpia el documento y omite el que queda en blanco', () => {
    expect(pedir({ documento_cliente: '  FE-1 ' }).get('documento_cliente')).toBe('FE-1');
    expect(pedir({ documento_cliente: '   ' }).has('documento_cliente')).toBeFalse();
  });

  it('traduce el estado a sus parámetros de fluor', () => {
    const params = pedir({ estado: 'despachadas' });
    expect(params.get('estado_despachado')).toBe('true');
    expect(params.get('estado_entregado')).toBe('false');
    expect(params.get('estado_anulado')).toBe('false');
  });
});
