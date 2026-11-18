import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ENVIRONMENT } from '@semantica/core';
import { MembresiaClienteService } from '../../contenedores/services/membresia-cliente.service';
import { Visita, VisitaDetalle, estadoCompromiso, iniciales } from '../models/visita.model';
import { MAX_VISITAS, VisitaService, VisitasResultado } from './visita.service';

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
    service: TestBed.inject(VisitaService),
    http: TestBed.inject(HttpTestingController),
  };
}

const visita = (id: number): Visita => ({
  codigo_visita_pk: id,
  fecha: '2026-10-05T16:44:29',
  codigo_visita_tipo_fk: '4',
  visita_tipo_nombre: 'Análisis de seguridad',
  codigo_visita_motivo_fk: '4',
  visita_motivo_nombre: 'Análisis de seguridad electrónica',
  codigo_asesor_fk: 2,
  asesor_nombre: 'Asesora de prueba',
});

describe('Visitas', () => {
  it('consulta las del cliente de la membresía', () => {
    const { service, http } = configurar(20);
    let resultado: VisitasResultado | undefined;

    service.listar().subscribe((r) => (resultado = r));

    const req = http.expectOne((r) => r.url === '/api/crm/visita/lista-portal');
    expect(req.request.params.get('tercero_id')).toBe('20');
    expect(req.request.params.get('size')).toBe(String(MAX_VISITAS));
    req.flush({ total: 2, page: 1, size: MAX_VISITAS, items: [visita(2), visita(1)] });

    expect(resultado?.items.map((v) => v.codigo_visita_pk)).toEqual([2, 1]);
    expect(resultado?.incompleto).toBe(false);
    http.verify();
  });

  it('avisa cuando el cliente tiene más visitas de las consultadas', () => {
    const { service, http } = configurar(20);
    let resultado: VisitasResultado | undefined;

    service.listar().subscribe((r) => (resultado = r));

    http
      .expectOne((r) => r.url === '/api/crm/visita/lista-portal')
      .flush({ total: MAX_VISITAS + 1, page: 1, size: MAX_VISITAS, items: [visita(1)] });

    expect(resultado?.incompleto).toBe(true);
    http.verify();
  });

  it('consulta el detalle de la visita con el cliente de la membresía', () => {
    const { service, http } = configurar(20);
    let resultado: VisitaDetalle | undefined;

    service.detalle(5).subscribe((r) => (resultado = r));

    const req = http.expectOne((r) => r.url === '/api/crm/visita/detalle-portal/5');
    expect(req.request.params.get('tercero_id')).toBe('20');
    req.flush({
      ...visita(5),
      compromisos: [
        {
          codigo_visita_compromiso_pk: 6,
          fecha: '2026-10-25',
          nombre: 'Revisar cámaras',
          detalle: null,
          cliente: true,
          estado_atendido: false,
        },
      ],
      reportes: [],
      cantidad_archivos: 0,
    });

    expect(resultado?.compromisos.length).toBe(1);
    expect(resultado?.reportes).toEqual([]);
    http.verify();
  });

  it('imprime, lista y descarga los archivos validando el cliente', () => {
    const { service, http } = configurar(20);

    service.imprimir(5).subscribe();
    service.archivos(5).subscribe();
    service.descargar(5, 9).subscribe();

    for (const url of [
      '/api/crm/visita/imprimir-portal/5',
      '/api/crm/visita/5/archivos',
      '/api/crm/visita/5/archivo/9/descargar',
    ]) {
      const req = http.expectOne((r) => r.url === url);
      expect(req.request.params.get('tercero_id')).toBe('20');
      req.flush(url.endsWith('archivos') ? [] : new Blob());
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

describe('estadoCompromiso', () => {
  const hoy = '2026-11-10';

  it('un compromiso atendido queda atendido aunque su fecha haya pasado', () => {
    expect(estadoCompromiso({ estado_atendido: true, fecha: '2026-01-01' }, hoy)).toBe('atendido');
  });

  it('un pendiente con fecha pasada está vencido', () => {
    expect(estadoCompromiso({ estado_atendido: false, fecha: '2026-11-09' }, hoy)).toBe('vencido');
  });

  it('un pendiente de hoy, futuro o sin fecha sigue pendiente', () => {
    expect(estadoCompromiso({ estado_atendido: false, fecha: hoy }, hoy)).toBe('pendiente');
    expect(estadoCompromiso({ estado_atendido: false, fecha: '2026-12-01' }, hoy)).toBe(
      'pendiente',
    );
    expect(estadoCompromiso({ estado_atendido: false, fecha: null }, hoy)).toBe('pendiente');
  });
});

describe('iniciales', () => {
  it('toma la inicial de las dos primeras palabras', () => {
    expect(iniciales('juan pérez gómez')).toBe('JP');
    expect(iniciales('cgm')).toBe('C');
    expect(iniciales('  ')).toBe('?');
    expect(iniciales(null)).toBe('?');
  });
});
