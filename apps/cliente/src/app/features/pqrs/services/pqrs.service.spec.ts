import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ENVIRONMENT } from '@semantica/core';
import { MembresiaClienteService } from '../../contenedores/services/membresia-cliente.service';
import { Pqrs, estadoPqrs } from '../models/pqrs.model';
import { MAX_PQRS, PqrsResultado, PqrsService } from './pqrs.service';

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
    service: TestBed.inject(PqrsService),
    http: TestBed.inject(HttpTestingController),
  };
}

const pqrs = (id: number): Pqrs => ({
  codigo_solicitud_pk: id,
  descripcion: 'El vigilante no hizo la ronda',
  codigo_solicitud_tipo_fk: 'QUE',
  solicitud_tipo_nombre: 'Queja',
  codigo_tercero_fk: 20,
  tercero_nombre_corto: 'Cliente de prueba',
  codigo_canal_fk: 'POR',
  canal_nombre: 'Portal servicios',
  fecha: '2026-10-01',
  fecha_registro: '2026-10-01',
  fecha_vencimiento: '2026-10-15',
  fecha_respuesta: null,
  fecha_cierre: null,
  estado_autorizado: false,
  estado_aprobado: false,
  estado_anulado: false,
  estado_cerrado: false,
});

describe('PQRS', () => {
  it('consulta las del cliente de la membresía', () => {
    const { service, http } = configurar(20);
    let resultado: PqrsResultado | undefined;

    service.listar().subscribe((r) => (resultado = r));

    const req = http.expectOne((r) => r.url === '/api/crm/solicitud/lista-portal');
    expect(req.request.params.get('tercero_id')).toBe('20');
    expect(req.request.params.get('size')).toBe(String(MAX_PQRS));
    req.flush({ total: 2, page: 1, size: MAX_PQRS, items: [pqrs(23), pqrs(22)] });

    expect(resultado?.items.map((p) => p.codigo_solicitud_pk)).toEqual([23, 22]);
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

  it('al crear no envía el tercero: fluor lo toma de la membresía', () => {
    const { service, http } = configurar(20);

    service
      .crear({
        codigo_solicitud_tipo_fk: 'QUE',
        descripcion: 'El vigilante no hizo la ronda',
        nombre_contacto: null,
        numero_identificacion_contacto: null,
        telefono_contacto: null,
        correo_contacto: null,
        cargo_contacto: null,
      })
      .subscribe();

    const req = http.expectOne('/api/crm/solicitud/nuevo-portal');
    expect(req.request.method).toBe('POST');
    expect('tercero_id' in req.request.body).toBe(false);
    http.verify();
  });

  it('consulta el detalle, los archivos y la descarga validando el cliente', () => {
    const { service, http } = configurar(20);

    service.detalle(23).subscribe();
    service.archivos(23).subscribe();
    service.descargar(23, 9).subscribe();

    for (const url of [
      '/api/crm/solicitud/detalle-portal/23',
      '/api/crm/solicitud/23/archivos',
      '/api/crm/solicitud/23/archivo/9/descargar',
    ]) {
      const req = http.expectOne((r) => r.url === url);
      expect(req.request.params.get('tercero_id')).toBe('20');
      req.flush(url.endsWith('descargar') ? new Blob() : url.endsWith('archivos') ? [] : {});
    }
    http.verify();
  });
});

describe('estadoPqrs', () => {
  const estados = {
    estado_autorizado: false,
    estado_aprobado: false,
    estado_anulado: false,
    estado_cerrado: false,
  };

  it('la anulación prevalece y luego el cierre', () => {
    expect(estadoPqrs({ ...estados, estado_anulado: true, estado_cerrado: true }).label).toBe(
      'Anulada',
    );
    expect(estadoPqrs({ ...estados, estado_cerrado: true, estado_aprobado: true }).label).toBe(
      'Cerrada',
    );
  });

  it('distingue aprobada, autorizada y pendiente', () => {
    expect(estadoPqrs({ ...estados, estado_aprobado: true, estado_autorizado: true }).label).toBe(
      'Aprobada',
    );
    expect(estadoPqrs({ ...estados, estado_autorizado: true }).label).toBe('Autorizada');
    expect(estadoPqrs(estados).label).toBe('Pendiente');
  });
});
