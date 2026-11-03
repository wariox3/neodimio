import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ENVIRONMENT } from '@semantica/core';
import { MembresiaClienteService } from '../../contenedores/services/membresia-cliente.service';
import { DestinatarioService } from '../../destinatarios/services/destinatario.service';
import { NovedadService } from '../../novedades/services/novedad.service';
import { GuiaService } from './guia.service';

describe('Filtro por cliente de las listas', () => {
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: ENVIRONMENT, useValue: { apiUrl: '/api' } },
      ],
    });
    TestBed.inject(MembresiaClienteService).set(25);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('guías envía el cliente en codigo_tercero_fk', () => {
    TestBed.inject(GuiaService).listar({ page: 1, size: 10 }).subscribe();
    const req = http.expectOne((r) => r.url === '/api/tte/guia/lista');
    expect(req.request.params.get('codigo_tercero_fk')).toBe('25');
  });

  it('guías envía los filtros con los nombres de las columnas de fluor', () => {
    TestBed.inject(GuiaService)
      .listar({
        page: 1,
        size: 10,
        codigo_guia_pk: 7,
        documento_cliente: 'F-1',
        codigo_guia_tipo_fk: 'COR',
        codigo_servicio_fk: 'PAQ',
        codigo_ciudad_origen_fk: '5001',
        codigo_ciudad_destino_fk: '11001',
        codigo_despacho_fk: 9,
        codigo_tercero_operacion_fk: 3,
      })
      .subscribe();
    const { params } = http.expectOne((r) => r.url === '/api/tte/guia/lista').request;
    expect(params.get('codigo_guia_pk')).toBe('7');
    expect(params.get('documento_cliente')).toBe('F-1');
    expect(params.get('codigo_guia_tipo_fk')).toBe('COR');
    expect(params.get('codigo_servicio_fk')).toBe('PAQ');
    expect(params.get('codigo_ciudad_origen_fk')).toBe('5001');
    expect(params.get('codigo_ciudad_destino_fk')).toBe('11001');
    expect(params.get('codigo_despacho_fk')).toBe('9');
    expect(params.get('codigo_tercero_operacion_fk')).toBe('3');
  });

  it('guías omite los filtros vacíos', () => {
    TestBed.inject(GuiaService).listar({ page: 1, size: 10, documento_cliente: '' }).subscribe();
    const { params } = http.expectOne((r) => r.url === '/api/tte/guia/lista').request;
    expect(params.has('documento_cliente')).toBeFalse();
    expect(params.has('codigo_guia_pk')).toBeFalse();
  });

  it('novedades envía el cliente en codigo_tercero_fk', () => {
    TestBed.inject(NovedadService).listar({ page: 1, size: 10 }).subscribe();
    const req = http.expectOne((r) => r.url === '/api/tte/novedad/lista');
    expect(req.request.params.get('codigo_tercero_fk')).toBe('25');
  });

  it('destinatarios envía el cliente en codigo_tercero_fk', () => {
    TestBed.inject(DestinatarioService).listar({ page: 1, size: 10 }).subscribe();
    const req = http.expectOne((r) => r.url === '/api/tte/destinatario/lista');
    expect(req.request.params.get('codigo_tercero_fk')).toBe('25');
  });

  it('filtra los destinatarios por código solo cuando se indica', () => {
    const service = TestBed.inject(DestinatarioService);

    service.listar({ page: 1, size: 10, codigo_destinatario_pk: 7 }).subscribe();
    const conCodigo = http.expectOne((r) => r.url === '/api/tte/destinatario/lista');
    expect(conCodigo.request.params.get('codigo_destinatario_pk')).toBe('7');

    service.listar({ page: 1, size: 10 }).subscribe();
    const sinCodigo = http.expectOne((r) => r.url === '/api/tte/destinatario/lista');
    expect(sinCodigo.request.params.has('codigo_destinatario_pk')).toBeFalse();
  });
});
