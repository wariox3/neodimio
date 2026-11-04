import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { provideRouter, Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { ENVIRONMENT } from '@semantica/core';
import { MembresiaClienteService } from '../../../contenedores/services/membresia-cliente.service';
import { GuiaNuevaComponent } from './guia-nueva.component';

const URL_LIQUIDAR = '/api/tte/guia/liquidar';
const URL_CONDICION = '/api/tte/guia/condicion-especial';
const URL_NUEVO = '/api/tte/guia/nuevo';

describe('GuiaNuevaComponent: liquidación', () => {
  let fixture: ComponentFixture<GuiaNuevaComponent>;
  let component: GuiaNuevaComponent;
  let http: HttpTestingController;

  /** Responde los catálogos que pide la pantalla al abrir. */
  function cargarCatalogos(
    tercero = { condicion_codigo_precio_fk: 10 as number | null },
    tipos: object[] = [],
  ): void {
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
    responder('/api/tte/guia-tipo/descargar', tipos);
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

  it('consulta las condiciones del destino y las muestra arriba', fakeAsync(() => {
    avanzar();
    cargarCatalogos();
    component.form.patchValue({ codigo_guia_tipo_fk: 'COR', codigo_ciudad_destino_fk: '478' });
    avanzar(400);

    const req = http.expectOne(URL_CONDICION);
    expect(req.request.body).toEqual({
      codigo_tercero: 2,
      origen: '385',
      destino: '478',
      precio: 10,
      guia_tipo: 'COR',
      producto: 'VARIOS',
    });
    req.flush({
      error: false,
      condicion_especial_flete: true,
      condicion_especial_manejo: false,
      peso_minimo: 5,
      peso_minimo_guia: 20,
      manejo_minimo_unidad: 300,
      manejo_minimo_guia: 1500,
    });
    avanzar();

    expect(component.condicion()?.peso_minimo_guia).toBe(20);
    const texto = (fixture.nativeElement as HTMLElement).querySelector('.condiciones')?.textContent;
    expect(texto).toContain('Peso mínimo guía');
    expect(texto).toContain('1,500');
    expect(texto).toContain('condición especial de');
    fixture.destroy();
  }));

  it('oculta las condiciones al cambiar el destino y no las consulta sin destino', fakeAsync(() => {
    avanzar();
    cargarCatalogos();
    http.expectNone(URL_CONDICION);

    component.form.patchValue({ codigo_ciudad_destino_fk: '478' });
    avanzar(400);
    http.expectOne(URL_CONDICION).flush({ error: false, peso_minimo: 5 });
    avanzar();
    expect(component.condicion()).not.toBeNull();

    component.form.patchValue({ codigo_ciudad_destino_fk: '385' });
    avanzar(100);
    expect(component.condicion()).toBeNull();
    fixture.destroy();
  }));

  it('llena los pesos al salir de cada campo con los mínimos de la condición', fakeAsync(() => {
    avanzar();
    cargarCatalogos();
    component.form.patchValue({ codigo_ciudad_destino_fk: '478' });
    avanzar(400);
    http.expectOne(URL_CONDICION).flush({
      error: false,
      condicion_especial_flete: true,
      peso_minimo: 25,
      peso_minimo_guia: 25,
    });
    avanzar();

    component.form.patchValue({ unidades: 2 });
    component.alSalirDeUnidades();
    expect(component.form.controls.peso_real.value).toBe(50);

    component.alSalirDelPesoReal();
    expect(component.form.controls.peso_volumen.value).toBe(50);
    expect(component.form.controls.peso_facturado.value).toBe(50);

    component.form.patchValue({ peso_facturado: 10 });
    component.alSalirDelPesoFacturado();
    expect(component.form.controls.peso_facturado.value).toBe(50);
    fixture.destroy();
  }));

  it('sin condiciones no pisa el peso real al salir de unidades', fakeAsync(() => {
    avanzar();
    cargarCatalogos();
    component.form.patchValue({ peso_real: 12 });
    component.alSalirDeUnidades();
    expect(component.form.controls.peso_real.value).toBe(12);
    fixture.destroy();
  }));

  describe('tipo de guía', () => {
    const tipos = [
      {
        codigo_guia_tipo_pk: 'COR',
        nombre: 'CORRIENTE',
        codigo_pago_fk: null,
        validar_flete: true,
      },
      {
        codigo_guia_tipo_pk: 'CPT',
        nombre: 'CORTESIA',
        codigo_pago_fk: null,
        validar_flete: false,
      },
    ];

    function llenarGuia(tipo: string): void {
      component.form.patchValue({
        codigo_guia_tipo_fk: tipo,
        numero_identificacion_destinatario: '123',
        nombre_destinatario: 'Ana',
        direccion_destinatario: 'Calle 1',
        telefono_destinatario: '300',
        codigo_ciudad_destino_fk: '478',
        peso_real: 10,
        peso_facturado: 10,
      });
    }

    it('selecciona el primer tipo disponible, como terbio', fakeAsync(() => {
      avanzar();
      cargarCatalogos(undefined, tipos);
      expect(component.form.controls.codigo_guia_tipo_fk.value).toBe('COR');
      fixture.destroy();
    }));

    it('no guarda sin flete si el tipo lo valida', fakeAsync(() => {
      avanzar();
      cargarCatalogos(undefined, tipos);
      llenarGuia('COR');
      component.onSubmit();
      expect(component.errorMessage()).toBe('La guía debe tener un flete.');

      llenarGuia('CPT');
      avanzar(400);
      http.expectOne(URL_LIQUIDAR).flush({ error: false, flete: 0, manejo: 0, peso_facturado: 10 });
      avanzar();
      component.onSubmit();
      expect(component.errorMessage()).toBeNull();
      http.expectOne(URL_NUEVO);
      fixture.destroy();
    }));

    it('guarda con los valores liquidados y abre el detalle de la guía', fakeAsync(() => {
      const navegar = spyOn(TestBed.inject(Router), 'navigateByUrl').and.resolveTo(true);
      avanzar();
      cargarCatalogos(undefined, tipos);
      llenarGuia('COR');
      component.form.patchValue({ direccion_destinatario: '  Calle   1  # 2 ' });
      avanzar(400);
      http
        .expectOne(URL_LIQUIDAR)
        .flush({ error: false, flete: 19468, manejo: 1250, peso_facturado: 25 });
      avanzar();

      component.onSubmit();
      const req = http.expectOne(URL_NUEVO);
      expect(req.request.body).toEqual(
        jasmine.objectContaining({
          codigo_guia_tipo_fk: 'COR',
          codigo_operacion_ingreso_fk: 'MED',
          codigo_tercero_fk: 2,
          codigo_adquiriente_fk: 2,
          codigo_empaque_fk: 'VARIOS',
          codigo_servicio_fk: 'PAQ',
          codigo_ciudad_origen_fk: '385',
          codigo_ciudad_destino_fk: '478',
          direccion_destinatario: 'Calle 1 # 2',
          vr_flete: 19468,
          vr_manejo: 1250,
          liquidar: false,
          zona: 'ORI2',
          estado_recogido: true,
          estado_ingreso: true,
        }),
      );
      expect(component.guardando()).toBeTrue();
      req.flush({ codigo_guia_pk: 991 });
      avanzar();

      expect(component.guardando()).toBeFalse();
      expect(navegar).toHaveBeenCalledWith(jasmine.stringMatching(/guias\/991$/));
      fixture.destroy();
    }));

    it('muestra el motivo si fluor rechaza la guía', fakeAsync(() => {
      avanzar();
      cargarCatalogos(undefined, tipos);
      llenarGuia('COR');
      avanzar(400);
      http
        .expectOne(URL_LIQUIDAR)
        .flush({ error: false, flete: 100, manejo: 0, peso_facturado: 10 });
      avanzar();

      component.onSubmit();
      http
        .expectOne(URL_NUEVO)
        .flush({ detail: 'Producto no encontrado' }, { status: 404, statusText: 'Not Found' });
      avanzar();
      expect(component.errorMessage()).toBe('Producto no encontrado');
      expect(component.guardando()).toBeFalse();
      fixture.destroy();
    }));

    it('no guarda mientras se está liquidando', fakeAsync(() => {
      avanzar();
      cargarCatalogos(undefined, tipos);
      llenarGuia('CPT');
      component.onSubmit();
      expect(component.errorMessage()).toBe('Espera a que termine de calcular los valores.');
      http.expectNone(URL_NUEVO);
      fixture.destroy();
    }));
  });
});
