import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { Router, provideRouter } from '@angular/router';
import { Subject, of } from 'rxjs';
import { PaginatedResponse } from '@erp/core';
import { Guia, GuiaCiudad } from '../../guia.model';
import { GuiaService } from '../../guia.service';
import { GuiasListComponent } from './guias-list.component';

const respuesta = (items: Partial<Guia>[]): PaginatedResponse<Guia> =>
  ({ items, total: items.length, page: 1, size: 25 }) as unknown as PaginatedResponse<Guia>;

describe('GuiasListComponent', () => {
  let fixture: ComponentFixture<GuiasListComponent>;
  let component: GuiasListComponent;
  let service: jasmine.SpyObj<GuiaService>;

  beforeEach(async () => {
    service = jasmine.createSpyObj<GuiaService>('GuiaService', ['listar', 'ciudades']);
    service.listar.and.returnValue(of(respuesta([])));
    service.ciudades.and.returnValue(
      of([{ codigo_ciudad_pk: '05001', nombre: 'Medellín' }] as GuiaCiudad[]),
    );

    await TestBed.configureTestingModule({
      imports: [GuiasListComponent],
      providers: [
        provideRouter([]),
        provideNoopAnimations(),
        { provide: GuiaService, useValue: service },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(GuiasListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('carga la primera página de 25 al iniciar', () => {
    expect(service.listar.calls.mostRecent().args.slice(0, 2)).toEqual([1, 25]);
  });

  it('pide al backend la página siguiente, que empieza en uno', () => {
    component.irAPagina(2);
    expect(component.pagina()).toBe(2);
    expect(service.listar.calls.mostRecent().args[0]).toBe(3);
  });

  it('al filtrar vuelve a la primera página', () => {
    component.irAPagina(4);
    component.buscar();
    expect(component.pagina()).toBe(0);
    expect(service.listar.calls.mostRecent().args[0]).toBe(1);
  });

  it('resuelve el nombre de la ciudad y cae al código si no está en el catálogo', () => {
    service.listar.and.returnValue(
      of(respuesta([{ codigo_ciudad_origen_fk: '05001', codigo_ciudad_destino_fk: '99999' }])),
    );
    component.buscar();
    const [fila] = component.filas();
    expect(fila.origen_nombre).toBe('Medellín');
    expect(fila.destino_nombre).toBe('99999');
  });

  it('una carga nueva descarta la respuesta de la anterior', () => {
    const primera = new Subject<PaginatedResponse<Guia>>();
    const segunda = new Subject<PaginatedResponse<Guia>>();
    service.listar.and.returnValues(primera, segunda);
    component.irAPagina(1);
    component.irAPagina(2);

    primera.next(respuesta([{ codigo_guia_pk: 1 }]));
    expect(component.guias().length).toBe(0);
    segunda.next(respuesta([{ codigo_guia_pk: 2 }]));
    expect(component.guias()[0].codigo_guia_pk).toBe(2);
  });

  it('abre el detalle de la guía', () => {
    const navegar = spyOn(TestBed.inject(Router), 'navigateByUrl').and.resolveTo(true);
    component.onAccion({ actionId: 'ver', row: { codigo_guia_pk: 53489 } as never });
    expect(navegar.calls.mostRecent().args[0]).toContain('/detalle/53489');
  });
});
