import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ENVIRONMENT } from '@semantica/core';
import { MembresiaClienteService } from '../../contenedores/services/membresia-cliente.service';
import { identificacionCliente } from '../models/informacion.model';
import { InformacionService } from './informacion.service';

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
    service: TestBed.inject(InformacionService),
    http: TestBed.inject(HttpTestingController),
  };
}

describe('Información del cliente', () => {
  it('consulta el tercero de la membresía', () => {
    const { service, http } = configurar(25);

    service.detalle().subscribe();

    http.expectOne('/api/gen/tercero/detalle/25').flush({ codigo_tercero_pk: 25 });
    http.verify();
  });

  it('sin cliente no consulta', () => {
    const { service, http } = configurar(null);
    let error: unknown;

    service.detalle().subscribe({ error: (e) => (error = e) });

    http.expectNone(() => true);
    expect(error).toBeInstanceOf(Error);
    http.verify();
  });
});

describe('identificacionCliente', () => {
  it('une tipo, número y dígito de verificación', () => {
    const base = { codigo_identificacion_fk: 'NI', numero_identificacion: '900123456' };
    expect(identificacionCliente({ ...base, digito_verificacion: '7' })).toBe('NI 900123456-7');
    expect(identificacionCliente({ ...base, digito_verificacion: null })).toBe('NI 900123456');
    expect(
      identificacionCliente({
        codigo_identificacion_fk: null,
        numero_identificacion: null,
        digito_verificacion: null,
      }),
    ).toBe('—');
  });
});
