import { TestBed } from '@angular/core/testing';
import { ActiveTenantService } from '@semantica/core';
import { EstadoListaService } from './estado-lista.service';

describe('EstadoListaService', () => {
  let servicio: EstadoListaService;
  let tenant: ActiveTenantService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    tenant = TestBed.inject(ActiveTenantService);
    tenant.set({ id: 1, nombre: 'Uno', propietario: false });
    servicio = TestBed.inject(EstadoListaService);
    servicio.limpiar();
  });

  afterEach(() => {
    servicio.limpiar();
    tenant.clear();
  });

  it('recupera filtros y paginación, con las fechas como Date', () => {
    const fecha = new Date(2026, 10, 3);
    servicio.guardar('guias', { filtros: { fecha, estado: null }, first: 50, rows: 25 });

    const estado = servicio.leer<{ fecha: Date; estado: null }>('guias');

    expect(estado?.filtros.fecha).toEqual(fecha);
    expect(estado?.filtros.estado).toBeNull();
    expect(estado?.first).toBe(50);
    expect(estado?.rows).toBe(25);
  });

  it('separa el estado por empresa', () => {
    servicio.guardar('guias', { filtros: {}, first: 50, rows: 25 });
    tenant.set({ id: 2, nombre: 'Dos', propietario: false });
    expect(servicio.leer('guias')).toBeNull();
  });

  it('limpiar olvida los listados de todas las empresas', () => {
    servicio.guardar('guias', { filtros: {}, first: 0, rows: 25 });
    tenant.set({ id: 2, nombre: 'Dos', propietario: false });
    servicio.guardar('guias', { filtros: {}, first: 0, rows: 25 });

    servicio.limpiar();

    expect(servicio.leer('guias')).toBeNull();
    tenant.set({ id: 1, nombre: 'Uno', propietario: false });
    expect(servicio.leer('guias')).toBeNull();
  });

  it('ignora un valor guardado que esté corrupto', () => {
    sessionStorage.setItem('semantica-estado-lista:1:guias', '{no es json');
    expect(servicio.leer('guias')).toBeNull();
  });
});
