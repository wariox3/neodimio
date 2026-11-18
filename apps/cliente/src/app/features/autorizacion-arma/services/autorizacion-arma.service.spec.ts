import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ENVIRONMENT } from '@semantica/core';
import { MembresiaClienteService } from '../../contenedores/services/membresia-cliente.service';
import { estadoFecha } from '../models/autorizacion-arma.model';
import {
  AutorizacionArmaService,
  AutorizacionesResultado,
  MAX_AUTORIZACIONES,
} from './autorizacion-arma.service';

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
    service: TestBed.inject(AutorizacionArmaService),
    http: TestBed.inject(HttpTestingController),
  };
}

describe('Autorización arma', () => {
  it('consulta los empleados del cliente de la membresía', () => {
    const { service, http } = configurar(20);
    let resultado: AutorizacionesResultado | undefined;

    service.listar().subscribe((r) => (resultado = r));

    const req = http.expectOne((r) => r.url === '/api/rhu/autorizacion_arma/lista-portal');
    expect(req.request.params.get('tercero_id')).toBe('20');
    expect(req.request.params.get('size')).toBe(String(MAX_AUTORIZACIONES));
    req.flush({ total: 0, page: 1, size: MAX_AUTORIZACIONES, items: [] });

    expect(resultado?.incompleto).toBe(false);
    http.verify();
  });

  it('imprime uno y los vigentes validando el cliente', () => {
    const { service, http } = configurar(20);

    service.imprimir(671).subscribe();
    service.imprimirVigentes().subscribe();

    for (const url of [
      '/api/rhu/autorizacion_arma/imprimir-portal/671',
      '/api/rhu/autorizacion_arma/imprimir-portal-todos',
    ]) {
      const req = http.expectOne((r) => r.url === url);
      expect(req.request.params.get('tercero_id')).toBe('20');
      req.flush(new Blob());
    }
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

describe('estadoFecha', () => {
  const hoy = '2026-11-10';

  it('una fecha de hoy o futura está vigente; una pasada, vencida', () => {
    expect(estadoFecha(hoy, hoy)).toBe('vigente');
    expect(estadoFecha('2027-01-01', hoy)).toBe('vigente');
    expect(estadoFecha('2026-11-09', hoy)).toBe('vencida');
    expect(estadoFecha(null, hoy)).toBe('sin-fecha');
  });
});
