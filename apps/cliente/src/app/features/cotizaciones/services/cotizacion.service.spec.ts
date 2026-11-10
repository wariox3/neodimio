import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ENVIRONMENT } from '@semantica/core';
import { MembresiaClienteService } from '../../contenedores/services/membresia-cliente.service';
import { Cotizacion, estadoCotizacion, negocioCotizacion } from '../models/cotizacion.model';
import { CotizacionService, CotizacionesResultado, MAX_COTIZACIONES } from './cotizacion.service';

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
    service: TestBed.inject(CotizacionService),
    http: TestBed.inject(HttpTestingController),
  };
}

const cotizacion = (id: number): Cotizacion => ({
  codigo_cotizacion_pk: id,
  numero: 0,
  fecha: '2026-09-10',
  vencimiento: '2026-12-31',
  codigo_cotizacion_tipo_fk: '1',
  cotizacion_tipo_nombre: 'Vigilancia física',
  codigo_tercero_fk: 20,
  tercero_nombre_corto: 'Cliente de prueba',
  codigo_asesor_fk: 3,
  asesor_nombre: 'Asesor de prueba',
  codigo_forma_pago_fk: 'CON',
  forma_pago_nombre: 'Contado',
  codigo_negocio_fk: null,
  negocio_nombre: null,
  vr_subtotal: 1000,
  vr_iva: 19,
  vr_neto: 0,
  vr_total: 1019,
  estado_autorizado: true,
  estado_aprobado: false,
  estado_anulado: false,
});

describe('Cotizaciones', () => {
  it('consulta las del cliente de la membresía', () => {
    const { service, http } = configurar(20);
    let resultado: CotizacionesResultado | undefined;

    service.listar().subscribe((r) => (resultado = r));

    const req = http.expectOne((r) => r.url === '/api/crm/cotizacion/lista-portal');
    expect(req.request.params.get('tercero_id')).toBe('20');
    expect(req.request.params.get('size')).toBe(String(MAX_COTIZACIONES));
    req.flush({
      total: 2,
      page: 1,
      size: MAX_COTIZACIONES,
      items: [cotizacion(39), cotizacion(27)],
    });

    expect(resultado?.items.map((c) => c.codigo_cotizacion_pk)).toEqual([39, 27]);
    expect(resultado?.incompleto).toBe(false);
    http.verify();
  });

  it('avisa cuando el cliente tiene más cotizaciones de las consultadas', () => {
    const { service, http } = configurar(20);
    let resultado: CotizacionesResultado | undefined;

    service.listar().subscribe((r) => (resultado = r));

    http
      .expectOne((r) => r.url === '/api/crm/cotizacion/lista-portal')
      .flush({ total: MAX_COTIZACIONES + 1, page: 1, size: MAX_COTIZACIONES, items: [] });

    expect(resultado?.incompleto).toBe(true);
    http.verify();
  });

  it('sin cliente no consulta, porque fluor exige el tercero', () => {
    const { service, http } = configurar(null);
    let error: unknown;

    service.listar().subscribe({ error: (e) => (error = e) });

    http.expectNone(() => true);
    expect(error).toBeInstanceOf(Error);
    http.verify();
  });
});

describe('estadoCotizacion', () => {
  const estados = { estado_autorizado: false, estado_aprobado: false, estado_anulado: false };

  it('la anulación prevalece sobre los demás estados', () => {
    expect(
      estadoCotizacion({
        estado_autorizado: true,
        estado_aprobado: true,
        estado_anulado: true,
      }).label,
    ).toBe('Anulada');
  });

  it('distingue aprobada, autorizada y pendiente', () => {
    expect(
      estadoCotizacion({ ...estados, estado_autorizado: true, estado_aprobado: true }).label,
    ).toBe('Aprobada');
    expect(estadoCotizacion({ ...estados, estado_autorizado: true }).label).toBe('Autorizada');
    expect(estadoCotizacion(estados).label).toBe('Pendiente');
    expect(
      estadoCotizacion({ estado_autorizado: null, estado_aprobado: null, estado_anulado: null })
        .label,
    ).toBe('Pendiente');
  });
});

describe('negocioCotizacion', () => {
  it('antepone el código del negocio cuando lo tiene', () => {
    expect(negocioCotizacion({ codigo_negocio_fk: 12, negocio_nombre: 'Planta' })).toBe(
      '12 - Planta',
    );
    expect(negocioCotizacion({ codigo_negocio_fk: 12, negocio_nombre: null })).toBe('12');
    expect(negocioCotizacion({ codigo_negocio_fk: null, negocio_nombre: null })).toBe('—');
  });
});
