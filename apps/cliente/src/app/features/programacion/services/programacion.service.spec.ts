import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ENVIRONMENT } from '@semantica/core';
import { MembresiaClienteService } from '../../contenedores/services/membresia-cliente.service';
import { Programacion, diasDelMes, ordenarPorPuesto } from '../models/programacion.model';
import { MAX_PROGRAMACIONES, ProgramacionService } from './programacion.service';

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
    service: TestBed.inject(ProgramacionService),
    http: TestBed.inject(HttpTestingController),
  };
}

const programacion = (id: number, puesto: number | null, empleado: string): Programacion => ({
  codigo_programacion_pk: id,
  codigo_puesto_fk: puesto,
  codigo_empleado_fk: id,
  anio: 2026,
  mes: 10,
  puesto_nombre: `Puesto ${puesto}`,
  empleado_nombre: empleado,
  cargo_nombre: null,
  modalidad_nombre: null,
});

describe('Programación del cliente', () => {
  it('consulta el mes completo del cliente de la membresía, agrupado por puesto', () => {
    const { service, http } = configurar(25);
    let ids: number[] = [];

    service.delMes(2026, 10).subscribe((r) => (ids = r.items.map((p) => p.codigo_programacion_pk)));

    const req = http.expectOne((r) => r.url === '/api/tur/programacion/lista');
    const params = req.request.params;
    expect(params.get('tercero_id')).toBe('25');
    expect(params.get('anio')).toBe('2026');
    expect(params.get('mes')).toBe('10');
    expect(params.get('size')).toBe(String(MAX_PROGRAMACIONES));
    req.flush({
      total: 3,
      page: 1,
      size: MAX_PROGRAMACIONES,
      items: [programacion(3, 20, 'Ana'), programacion(2, 10, 'Luis'), programacion(1, 20, 'Beto')],
    });

    expect(ids).toEqual([2, 3, 1]);
    http.verify();
  });

  it('sin cliente no consulta, porque fluor devolvería la programación de todos', () => {
    const { service, http } = configurar(null);
    let error: unknown;

    service.delMes(2026, 10).subscribe({ error: (e) => (error = e) });

    http.expectNone(() => true);
    expect(error).toBeInstanceOf(Error);
    http.verify();
  });
});

describe('ordenarPorPuesto', () => {
  it('no modifica la lista original', () => {
    const lista = [programacion(1, 20, 'Ana'), programacion(2, 10, 'Ana')];
    ordenarPorPuesto(lista);
    expect(lista.map((p) => p.codigo_programacion_pk)).toEqual([1, 2]);
  });
});

describe('diasDelMes', () => {
  it('tiene los días del mes con su día de la semana', () => {
    const noviembre = diasDelMes(2026, 11);
    expect(noviembre.length).toBe(30);
    // El 1 de noviembre de 2026 es domingo.
    expect(noviembre[0]).toEqual({ numero: 1, campo: 'dia_1', inicial: 'D', finDeSemana: true });
    expect(noviembre[1].finDeSemana).toBeFalse();
  });

  it('considera los años bisiestos', () => {
    expect(diasDelMes(2028, 2).length).toBe(29);
    expect(diasDelMes(2026, 2).length).toBe(28);
  });
});
