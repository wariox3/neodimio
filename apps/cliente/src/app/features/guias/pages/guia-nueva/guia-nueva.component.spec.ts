import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';
import { MessageService } from 'primeng/api';
import { ENVIRONMENT } from '@semantica/core';
import { MembresiaClienteService } from '../../../contenedores/services/membresia-cliente.service';
import { GuiaNuevaComponent } from './guia-nueva.component';

const URL_LIQUIDAR = '/api/tte/guia/liquidar';

describe('GuiaNuevaComponent: liquidación', () => {
  let fixture: ComponentFixture<GuiaNuevaComponent>;
  let component: GuiaNuevaComponent;
  let http: HttpTestingController;

  /** Responde los catálogos que pide la pantalla al abrir. */
  function cargarCatalogos(tercero = { condicion_codigo_precio_fk: 10 as number | null }): void {
    const responder = (url: string, cuerpo: object) =>
      http.expectOne((r) => r.url === url).flush(cuerpo);
    const pagina = { total: 0, page: 1, size: 10, items: [] };

    responder('/api/gen/tercero/detalle/2', {
      codigo_tercero_pk: 2,
      codigo_condicion_fk: 18,
      liquidar_guia_peso: false,
      liquidar_guia_unidad: true,
      ...tercero,
    });
    responder('/api/tte/guia-tipo/descargar', []);
    responder('/api/tte/tercero-operacion/lista', pagina);
    responder('/api/tte/tercero-producto/buscar', pagina);
    responder('/api/tte/ciudad/descargar', [
      { codigo_ciudad_pk: '385', nombre: 'MEDELLIN', codigo_zona_fk: 'ARM' },
      { codigo_ciudad_pk: '478', nombre: 'RIONEGRO', codigo_zona_fk: 'ORI2' },
    ]);
    responder('/api/mas/user-tenant-configuracion/9', {
      user_tenant_id: 9,
      codigo_operacion_fk: 'MED',
      codigo_tercero_operacion_fk: null,
      codigo_ciudad_origen_fk: null,
    });
    responder('/api/tte/operacion/detalle/MED', { codigo_ciudad_fk: '385' });
    avanzar();
  }

  function avanzar(ms = 0): void {
    fixture.detectChanges();
    tick(ms);
    fixture.detectChanges();
    tick();
  }

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [GuiaNuevaComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideNoopAnimations(),
        provideRouter([]),
        MessageService,
        { provide: ENVIRONMENT, useValue: { apiUrl: '/api' } },
      ],
    });
    TestBed.inject(MembresiaClienteService).set(2, 9);
    http = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(GuiaNuevaComponent);
    component = fixture.componentInstance;
  });

  it('liquida con el origen de la operación y muestra los valores', fakeAsync(() => {
    avanzar();
    cargarCatalogos();
    expect(component.origenTexto()).toBe('MEDELLIN [385]');

    component.form.patchValue({ codigo_ciudad_destino_fk: '478', codigo_producto_fk: '17' });
    avanzar(400);

    const req = http.expectOne(URL_LIQUIDAR);
    expect(req.request.body).toEqual(
      jasmine.objectContaining({
        tercero: 2,
        condicion: 18,
        precio: 10,
        origen: '385',
        destino: '478',
        producto: '17',
        zona: 'ORI2',
        tipo_liquidacion: 'U',
      }),
    );
    req.flush({ error: false, flete: 10507, manejo: 20, peso_facturado: 15 });
    avanzar();

    expect(component.flete()).toBe(10507);
    expect(component.total()).toBe(10527);
    expect(component.pesoFacturado()).toBe(15);
    fixture.destroy();
  }));

  it('al cambiar un dato pone los valores en 0 y consulta una sola vez tras la espera', fakeAsync(() => {
    avanzar();
    cargarCatalogos();
    component.form.patchValue({ codigo_ciudad_destino_fk: '478' });
    avanzar(400);
    http
      .expectOne(URL_LIQUIDAR)
      .flush({ error: false, flete: 10507, manejo: 0, peso_facturado: 15 });
    avanzar();

    component.form.patchValue({ unidades: 2 });
    avanzar(100);
    expect(component.flete()).toBe(0);
    component.form.patchValue({ unidades: 3 });
    avanzar(100);
    http.expectNone(URL_LIQUIDAR);

    avanzar(400);
    const req = http.expectOne(URL_LIQUIDAR);
    expect(req.request.body.unidades).toBe(3);
    req.flush({ error: false, flete: 31521, manejo: 0, peso_facturado: 15 });
    avanzar();
    expect(component.flete()).toBe(31521);
    fixture.destroy();
  }));

  it('avisa y no consulta si el cliente no tiene lista de precios', fakeAsync(() => {
    avanzar();
    cargarCatalogos({ condicion_codigo_precio_fk: null });

    component.form.patchValue({ codigo_ciudad_destino_fk: '478' });
    avanzar(400);

    http.expectNone(URL_LIQUIDAR);
    expect(component.avisoLiquidacion()).toBe('El cliente no tiene una lista de precios asignada.');
    fixture.destroy();
  }));

  it('avisa si fluor rechaza los datos', fakeAsync(() => {
    avanzar();
    cargarCatalogos();
    component.form.patchValue({ codigo_ciudad_destino_fk: '478' });
    avanzar(400);

    http
      .expectOne(URL_LIQUIDAR)
      .flush({ detail: 'Inválido' }, { status: 422, statusText: 'Unprocessable' });
    avanzar();

    expect(component.avisoLiquidacion()).toBe('No se pudo liquidar con estos datos.');
    expect(component.liquidando()).toBeFalse();
    fixture.destroy();
  }));
});
