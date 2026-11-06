import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ENVIRONMENT } from '@semantica/core';
import { MembresiaClienteService } from '../../contenedores/services/membresia-cliente.service';
import { Factura, numeroFactura } from '../models/factura.model';
import { FacturaService, MAX_FACTURAS } from './factura.service';

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
    service: TestBed.inject(FacturaService),
    http: TestBed.inject(HttpTestingController),
  };
}

const factura = (id: number, aprobada: boolean): Factura => ({
  codigo_factura_pk: id,
  codigo_factura_tipo_fk: 'FV',
  codigo_tercero_fk: 25,
  numero: id,
  prefijo: 'FE',
  fecha: '2026-10-01',
  fecha_vence: '2026-10-31',
  soporte: null,
  vr_subtotal: 1000,
  vr_iva: 190,
  vr_neto: 1190,
  vr_total: 1190,
  estado_aprobado: aprobada,
  estado_anulado: false,
  factura_tipo_nombre: 'Factura de venta',
});

describe('Facturas', () => {
  it('consulta las del cliente y deja solo las aprobadas', () => {
    const { service, http } = configurar(25);
    let resultado: Factura[] = [];

    service
      .listar({ fecha_desde: new Date(2026, 9, 1), fecha_hasta: new Date(2026, 9, 31) })
      .subscribe((r) => (resultado = r.items));

    const req = http.expectOne((r) => r.url === '/api/tur/factura/lista');
    const params = req.request.params;
    expect(params.get('tercero_id')).toBe('25');
    expect(params.get('size')).toBe(String(MAX_FACTURAS));
    expect(params.get('fecha_desde')).toBe('2026-10-01');
    expect(params.get('fecha_hasta')).toBe('2026-10-31');
    req.flush({
      total: 2,
      page: 1,
      size: MAX_FACTURAS,
      items: [factura(1, true), factura(2, false)],
    });

    expect(resultado.map((f) => f.codigo_factura_pk)).toEqual([1]);
    http.verify();
  });

  it('sin cliente no consulta, porque fluor devolvería las facturas de todos', () => {
    const { service, http } = configurar(null);
    let error: unknown;

    service.listar({}).subscribe({ error: (e) => (error = e) });

    http.expectNone(() => true);
    expect(error).toBeInstanceOf(Error);
    http.verify();
  });
});

describe('numeroFactura', () => {
  it('antepone el prefijo cuando lo tiene', () => {
    expect(numeroFactura({ prefijo: 'FE', numero: 1024 })).toBe('FE-1024');
    expect(numeroFactura({ prefijo: null, numero: 1024 })).toBe('1024');
    expect(numeroFactura({ prefijo: 'FE', numero: null })).toBe('—');
  });
});
