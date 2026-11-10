import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ENVIRONMENT } from '@semantica/core';
import { MembresiaClienteService } from '../../contenedores/services/membresia-cliente.service';
import { CONSIGNAS_GENERALES, Consigna, puestosDeConsignas } from '../models/consigna.model';
import { ConsignaService, ConsignasResultado, MAX_CONSIGNAS } from './consigna.service';

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
    service: TestBed.inject(ConsignaService),
    http: TestBed.inject(HttpTestingController),
  };
}

const consigna = (id: number, puesto: number | null, nombre: string | null): Consigna => ({
  codigo_consigna_pk: id,
  codigo_puesto_fk: puesto,
  puesto_nombre: nombre,
  consigna: 'Presentarse al puesto 15 minutos antes',
  habilitado_portal: true,
});

describe('Consignas', () => {
  it('consulta las del cliente de la membresía', () => {
    const { service, http } = configurar(20);
    let resultado: ConsignasResultado | undefined;

    service.listar().subscribe((r) => (resultado = r));

    const req = http.expectOne((r) => r.url === '/api/tur/consigna/lista-cliente');
    expect(req.request.params.get('tercero_id')).toBe('20');
    expect(req.request.params.get('size')).toBe(String(MAX_CONSIGNAS));
    req.flush({
      total: 1,
      page: 1,
      size: MAX_CONSIGNAS,
      items: [consigna(1, 10, 'Portería norte')],
    });

    expect(resultado?.items.length).toBe(1);
    expect(resultado?.incompleto).toBe(false);
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

describe('puestosDeConsignas', () => {
  it('lista los puestos sin repetir, por nombre y con las generales primero', () => {
    const puestos = puestosDeConsignas([
      consigna(1, 105, 'Ronda'),
      consigna(2, 10, 'Portería norte'),
      consigna(3, 105, 'Ronda'),
      consigna(4, null, null),
    ]);

    expect(puestos).toEqual([
      { value: 'generales', label: CONSIGNAS_GENERALES },
      { value: '10', label: 'Portería norte' },
      { value: '105', label: 'Ronda' },
    ]);
  });
});
