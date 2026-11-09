import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { MessageService } from 'primeng/api';
import { ENVIRONMENT } from '@semantica/core';
import { MembresiaClienteService } from '../../../contenedores/services/membresia-cliente.service';
import { Destinatario } from '../../models/destinatario.model';
import { DestinatarioNuevoComponent } from './destinatario-nuevo.component';

describe('DestinatarioNuevoComponent', () => {
  const URL = '/api/tte/destinatario/nuevo';
  const completo = {
    codigo_identificacion_fk: 'CC',
    numero_identificacion: '123',
    nombre_corto: 'Ana',
    direccion: 'Calle 1',
    telefono: '3000000000',
    codigo_ciudad_fk: '1',
  };
  let fixture: ComponentFixture<DestinatarioNuevoComponent>;
  let component: DestinatarioNuevoComponent;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [DestinatarioNuevoComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideNoopAnimations(),
        MessageService,
        { provide: ENVIRONMENT, useValue: { apiUrl: '/api' } },
      ],
    });
    TestBed.inject(MembresiaClienteService).set(25);
    http = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(DestinatarioNuevoComponent);
    component = fixture.componentInstance;
  });

  function abrir(inicial = {}): void {
    fixture.componentRef.setInput('inicial', inicial);
    component.visible.set(true);
    fixture.detectChanges();
  }

  it('al abrir trae lo escrito en la guía', () => {
    abrir({ numero_identificacion: '999', nombre_corto: 'Luis' });

    expect(component.form.controls.numero_identificacion.value).toBe('999');
    expect(component.form.controls.nombre_corto.value).toBe('Luis');
  });

  it('no envía nada si faltan datos', () => {
    abrir({ nombre_corto: 'Luis' });

    component.guardar();

    http.expectNone(URL);
    expect(component.errorMessage()).toBe('Revisa los campos marcados antes de guardar.');
  });

  it('al crearlo lo entrega a la guía y cierra el diálogo', () => {
    abrir(completo);
    const creados: Destinatario[] = [];
    component.creado.subscribe((d) => creados.push(d));

    component.guardar();
    http.expectOne(URL).flush({ codigo_destinatario_pk: 7 });

    expect(creados.map((d) => d.codigo_destinatario_pk)).toEqual([7]);
    expect(component.visible()).toBeFalse();
  });

  it('si fluor lo rechaza muestra el motivo y conserva los datos', () => {
    abrir(completo);

    component.guardar();
    http
      .expectOne(URL)
      .flush({ detail: 'Ya existe un destinatario' }, { status: 409, statusText: 'Conflict' });

    expect(component.errorMessage()).toBe('Ya existe un destinatario');
    expect(component.visible()).toBeTrue();
    expect(component.form.controls.nombre_corto.value).toBe('Ana');
  });

  it('no repite el aviso de los errores que ya maneja el interceptor', () => {
    abrir(completo);

    component.guardar();
    http.expectOne(URL).flush(null, { status: 500, statusText: 'Server Error' });

    expect(component.errorMessage()).toBeNull();
    expect(component.guardando()).toBeFalse();
  });
});
