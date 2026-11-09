import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { MessageService } from 'primeng/api';
import { ENVIRONMENT } from '@semantica/core';
import { MembresiaClienteService } from '../../../contenedores/services/membresia-cliente.service';
import { AdquirienteNuevoComponent } from './adquiriente-nuevo.component';

const URL_NUEVO = '/api/gen/tercero/nuevo';

describe('AdquirienteNuevoComponent', () => {
  let fixture: ComponentFixture<AdquirienteNuevoComponent>;
  let component: AdquirienteNuevoComponent;
  let http: HttpTestingController;

  function abrir(general = { codigo_asesor_general_fk: 3, codigo_condicion_general_fk: 18 }): void {
    fixture.componentRef.setInput('visible', true);
    fixture.detectChanges();
    tick();
    const responder = (url: string, cuerpo: object) =>
      http.expectOne((r) => r.url === url).flush(cuerpo);
    responder('/api/gen/identificacion/descargar', [
      { codigo_identificacion_pk: 'CC', nombre: 'CEDULA' },
      { codigo_identificacion_pk: 'NI', nombre: 'NIT' },
    ]);
    responder('/api/gen/ciudad/descargar', [{ codigo_ciudad_pk: 5001, nombre: 'MEDELLIN' }]);
    responder('/api/gen/configuracion/guia-nuevo', {
      codigo_precio_general_fk: null,
      ...general,
    });
    responder('/api/mas/user-tenant-configuracion/9', {
      user_tenant_id: 9,
      codigo_operacion_fk: 'MED',
    });
    fixture.detectChanges();
  }

  function llenar(campos: object = {}): void {
    component.form.patchValue({
      codigo_identificacion_fk: 'CC',
      numero_identificacion: '1036123456',
      nombre_corto: 'ANA PEREZ',
      nombre1: 'ANA',
      apellido1: 'PEREZ',
      telefono: '6044000',
      celular: '3001234567',
      direccion: 'CALLE 1',
      correo: 'ana@correo.co',
      codigo_ciudad_fk: 5001,
      ...campos,
    });
  }

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [AdquirienteNuevoComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideNoopAnimations(),
        MessageService,
        { provide: ENVIRONMENT, useValue: { apiUrl: '/api' } },
      ],
    });
    TestBed.inject(MembresiaClienteService).set(2, 9);
    http = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(AdquirienteNuevoComponent);
    component = fixture.componentInstance;
  });

  it('crea el tercero con los valores generales y lo emite como adquiriente', fakeAsync(() => {
    const creado = jasmine.createSpy('creado');
    component.creado.subscribe(creado);
    abrir();
    llenar();

    component.guardar();
    const req = http.expectOne(URL_NUEVO);
    expect(req.request.body).toEqual(
      jasmine.objectContaining({
        numero_identificacion: '1036123456',
        digito_verificacion: '5',
        codigo_asesor_fk: 3,
        codigo_condicion_fk: 18,
        codigo_operacion_fk: 'MED',
        cliente: true,
      }),
    );
    req.flush({
      codigo_tercero_pk: 77,
      codigo_identificacion_fk: 'CC',
      numero_identificacion: '1036123456',
      nombre_corto: 'ANA PEREZ',
    });
    tick();

    expect(creado).toHaveBeenCalledWith({
      codigo_tercero_pk: 77,
      codigo_identificacion_fk: 'CC',
      numero_identificacion: '1036123456',
      nombre_corto: 'ANA PEREZ',
    });
    expect(component.visible()).toBeFalse();
    fixture.destroy();
  }));

  it('no guarda un NIT que no tenga 9 dígitos', fakeAsync(() => {
    abrir();
    llenar({ codigo_identificacion_fk: 'NI', numero_identificacion: '12345' });

    component.guardar();
    http.expectNone(URL_NUEVO);
    expect(component.errorDe('numero_identificacion')).toContain('9 dígitos');
    fixture.destroy();
  }));

  it('avisa y no guarda si la empresa no tiene asesor o condición generales', fakeAsync(() => {
    abrir({ codigo_asesor_general_fk: 3, codigo_condicion_general_fk: null as unknown as number });
    expect(component.errorMessage()).toContain('asesor y la condición generales');
    llenar();

    component.guardar();
    http.expectNone(URL_NUEVO);
    fixture.destroy();
  }));

  it('muestra el motivo si fluor rechaza el tercero', fakeAsync(() => {
    abrir();
    llenar();
    component.guardar();
    http
      .expectOne(URL_NUEVO)
      .flush(
        { detail: 'Ya existe un tercero con el número de identificación 1036123456' },
        { status: 409, statusText: 'Conflict' },
      );
    tick();

    expect(component.errorMessage()).toContain('Ya existe un tercero');
    expect(component.guardando()).toBeFalse();
    fixture.destroy();
  }));
});
