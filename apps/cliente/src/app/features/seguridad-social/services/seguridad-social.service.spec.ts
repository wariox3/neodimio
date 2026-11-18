import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ENVIRONMENT } from '@semantica/core';
import { MembresiaClienteService } from '../../contenedores/services/membresia-cliente.service';
import { SeguridadSocial, tamanoLegible } from '../models/seguridad-social.model';
import { MAX_SEGURIDAD_SOCIAL, SeguridadSocialService } from './seguridad-social.service';

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
    service: TestBed.inject(SeguridadSocialService),
    http: TestBed.inject(HttpTestingController),
  };
}

const registro = (id: number): SeguridadSocial => ({
  codigo_aporte_contrato_pk: id,
  codigo_aporte_fk: 1,
  codigo_contrato_fk: id,
  codigo_empleado_fk: id,
  empleado_nombre: `Empleado ${id}`,
  numero_identificacion: `${id}`,
  cantidad_archivos: 1,
});

describe('Seguridad social del cliente', () => {
  it('consulta la planilla del mes del cliente de la membresía', () => {
    const { service, http } = configurar(20);
    let resultado: { ids: number[]; incompleto: boolean } | undefined;

    service.delMes(2026, 9).subscribe((r) => {
      resultado = {
        ids: r.items.map((s) => s.codigo_aporte_contrato_pk),
        incompleto: r.incompleto,
      };
    });

    const req = http.expectOne((r) => r.url === '/api/rhu/aporte_contrato/lista-portal');
    const params = req.request.params;
    expect(params.get('tercero_id')).toBe('20');
    expect(params.get('anio')).toBe('2026');
    expect(params.get('mes')).toBe('9');
    expect(params.get('size')).toBe(String(MAX_SEGURIDAD_SOCIAL));
    req.flush({ total: 3, page: 1, size: MAX_SEGURIDAD_SOCIAL, items: [registro(1), registro(2)] });

    expect(resultado).toEqual({ ids: [1, 2], incompleto: true });
    http.verify();
  });

  it('pide los soportes y su descarga con el cliente de la membresía', () => {
    const { service, http } = configurar(20);

    service.archivos(16837).subscribe();
    service.descargar(16837, 9388).subscribe();

    const archivos = http.expectOne((r) => r.url === '/api/rhu/aporte_contrato/16837/archivos');
    expect(archivos.request.params.get('tercero_id')).toBe('20');
    archivos.flush([]);

    const descarga = http.expectOne(
      (r) => r.url === '/api/rhu/aporte_contrato/16837/archivo/9388/descargar',
    );
    expect(descarga.request.params.get('tercero_id')).toBe('20');
    expect(descarga.request.responseType).toBe('blob');
    descarga.flush(new Blob(['%PDF-']));
    http.verify();
  });

  it('sin cliente no consulta, porque fluor exige el cliente', () => {
    const { service, http } = configurar(null);
    let error: unknown;

    service.delMes(2026, 9).subscribe({ error: (e) => (error = e) });

    http.expectNone(() => true);
    expect(error).toBeInstanceOf(Error);
    http.verify();
  });
});

describe('tamanoLegible', () => {
  it('muestra KB o MB según el tamaño', () => {
    expect(tamanoLegible(13291)).toBe('13 KB');
    expect(tamanoLegible(1_258_291)).toBe('1,2 MB');
    expect(tamanoLegible(null)).toBe('');
  });
});
