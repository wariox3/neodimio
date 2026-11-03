import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ENVIRONMENT } from '@semantica/core';
import { MembresiaClienteService } from '../../contenedores/services/membresia-cliente.service';
import { DestinatarioNuevo } from '../models/destinatario.model';
import { DestinatarioService } from './destinatario.service';

describe('Crear destinatario', () => {
  it('lo envía asociado al cliente de la membresía', () => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: ENVIRONMENT, useValue: { apiUrl: '/api' } },
      ],
    });
    TestBed.inject(MembresiaClienteService).set(25);
    const http = TestBed.inject(HttpTestingController);
    const datos: DestinatarioNuevo = {
      codigo_identificacion_fk: 'CC',
      numero_identificacion: '123',
      nombre_corto: 'Ana',
      direccion: 'Calle 1',
      telefono: '3000000000',
      codigo_ciudad_fk: '1',
    };

    TestBed.inject(DestinatarioService).crear(datos).subscribe();

    const req = http.expectOne('/api/tte/destinatario/nuevo');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ ...datos, codigo_tercero_fk: 25 });
    req.flush({ codigo_destinatario_pk: 1 });
    http.verify();
  });
});
