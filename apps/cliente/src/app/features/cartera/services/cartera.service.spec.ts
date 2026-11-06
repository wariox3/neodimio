import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ENVIRONMENT } from '@semantica/core';
import { MembresiaClienteService } from '../../contenedores/services/membresia-cliente.service';
import { MovimientoCartera, recibosVigentes } from '../models/cartera.model';
import { CarteraService, MAX_MOVIMIENTOS } from './cartera.service';

function configurar(clienteId: number | null) {
  TestBed.configureTestingModule({
    providers: [
      provideHttpClient(),
      provideHttpClientTesting(),
      { provide: ENVIRONMENT, useValue: { apiUrl: '/api' } },
    ],
  });
  if (clienteId !== null) TestBed.inject(MembresiaClienteService).set(clienteId);
  return {
    service: TestBed.inject(CarteraService),
    http: TestBed.inject(HttpTestingController),
  };
}

const movimiento = (
  id: number,
  aprobado: boolean | null,
  anulado: boolean | null,
): MovimientoCartera => ({
  codigo_movimiento_pk: id,
  codigo_movimiento_tipo_fk: 'RC',
  codigo_movimiento_clase_fk: 'RC',
  codigo_tercero_fk: 25,
  numero: id,
  fecha: '2026-10-01',
  fecha_documento: '2026-10-01',
  soporte: null,
  comentarios: null,
  vr_total_bruto: 1000,
  vr_retencion: 0,
  vr_total_neto: 1000,
  estado_aprobado: aprobado,
  estado_anulado: anulado,
  movimiento_tipo_nombre: 'Recibo de caja',
});

describe('Cartera pendiente', () => {
  it('consulta siempre las cuentas del cliente de la membresía', () => {
    const { service, http } = configurar(25);

    service
      .pendientes({
        page: 2,
        size: 50,
        numero_documento: 'FE',
        vencidas: true,
        fecha_desde: new Date(2026, 9, 1),
        fecha_hasta: new Date(2026, 9, 31),
      })
      .subscribe();

    const req = http.expectOne((r) => r.url === '/api/car/cuenta-cobrar/pendiente');
    const params = req.request.params;
    expect(params.get('tercero_id')).toBe('25');
    expect(params.get('page')).toBe('2');
    expect(params.get('numero_documento')).toBe('FE');
    expect(params.get('vencidas')).toBe('true');
    expect(params.get('fecha_desde')).toBe('2026-10-01');
    // `fecha` es `datetime`: se envía el día siguiente para incluir el 31.
    expect(params.get('fecha_hasta')).toBe('2026-11-01');
    req.flush({ total: 0, page: 2, size: 50, items: [] });
    http.verify();
  });

  it('sin vencidas no envía el filtro', () => {
    const { service, http } = configurar(25);

    service.pendientes({ page: 1, size: 50, vencidas: null }).subscribe();

    const req = http.expectOne((r) => r.url === '/api/car/cuenta-cobrar/pendiente');
    expect(req.request.params.has('vencidas')).toBeFalse();
    req.flush({ total: 0, page: 1, size: 50, items: [] });
    http.verify();
  });

  it('sin cliente no consulta, porque fluor devolvería la cartera de todos', () => {
    const { service, http } = configurar(null);
    let error: unknown;

    service.pendientes({ page: 1, size: 50 }).subscribe({ error: (e) => (error = e) });

    http.expectNone(() => true);
    expect(error).toBeInstanceOf(Error);
    http.verify();
  });
});

describe('Recibos', () => {
  it('deja solo los aprobados y no anulados del cliente', () => {
    const { service, http } = configurar(25);
    let resultado: MovimientoCartera[] = [];
    let incompleto = true;

    service.recibos({ fecha_hasta: new Date(2026, 9, 31) }).subscribe((r) => {
      resultado = r.items;
      incompleto = r.incompleto;
    });

    const req = http.expectOne((r) => r.url === '/api/car/movimiento/lista');
    expect(req.request.params.get('tercero_id')).toBe('25');
    expect(req.request.params.get('size')).toBe(String(MAX_MOVIMIENTOS));
    // `fecha` del movimiento es `date`: va tal cual.
    expect(req.request.params.get('fecha_hasta')).toBe('2026-10-31');
    req.flush({
      total: 3,
      page: 1,
      size: MAX_MOVIMIENTOS,
      items: [movimiento(1, true, false), movimiento(2, false, false), movimiento(3, true, true)],
    });

    expect(resultado.map((m) => m.codigo_movimiento_pk)).toEqual([1]);
    expect(incompleto).toBeFalse();
    http.verify();
  });

  it('avisa cuando fluor tiene más movimientos de los consultados', () => {
    const { service, http } = configurar(25);
    let incompleto = false;

    service.recibos({}).subscribe((r) => (incompleto = r.incompleto));

    http
      .expectOne((r) => r.url === '/api/car/movimiento/lista')
      .flush({ total: 500, page: 1, size: MAX_MOVIMIENTOS, items: [movimiento(1, true, false)] });

    expect(incompleto).toBeTrue();
    http.verify();
  });

  it('sin cliente no consulta', () => {
    const { service, http } = configurar(null);
    let error: unknown;

    service.recibos({}).subscribe({ error: (e) => (error = e) });

    http.expectNone(() => true);
    expect(error).toBeInstanceOf(Error);
    http.verify();
  });
});

describe('recibosVigentes', () => {
  it('trata un estado sin valor como no aprobado y no anulado', () => {
    const resultado = recibosVigentes([movimiento(1, null, null), movimiento(2, true, null)]);
    expect(resultado.map((m) => m.codigo_movimiento_pk)).toEqual([2]);
  });
});
