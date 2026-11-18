import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ENVIRONMENT } from '@semantica/core';
import { InvitacionRecibida } from '../models/contenedor.model';
import { InvitacionService } from './invitacion.service';

function configurar() {
  TestBed.configureTestingModule({
    providers: [
      provideHttpClient(),
      provideHttpClientTesting(),
      { provide: ENVIRONMENT, useValue: { apiUrl: '/api' } },
    ],
  });
  return {
    service: TestBed.inject(InvitacionService),
    http: TestBed.inject(HttpTestingController),
  };
}

const invitacion: InvitacionRecibida = {
  id: 7,
  tenant_id: 3,
  tenant_nombre: 'Seguridad ejemplo',
  usuario_id: 1,
  usuario_nombre: 'Ana Pérez',
  usuario_email: 'ana@ejemplo.com',
  fecha: '2026-11-18T10:00:00',
};

describe('InvitacionService', () => {
  it('consulta las invitaciones pendientes del usuario', () => {
    const { service, http } = configurar();
    let resultado: InvitacionRecibida[] = [];

    service.getPendientes().subscribe((r) => (resultado = r));

    const req = http.expectOne((r) => r.url === '/api/mas/invitacion/pendientes');
    expect(req.request.method).toBe('GET');
    req.flush({ total: 1, page: 1, size: 50, items: [invitacion] });

    expect(resultado.map((i) => i.id)).toEqual([7]);
    http.verify();
  });

  it('acepta como cliente y rechaza por id de invitación', () => {
    const { service, http } = configurar();

    service.aceptar(7).subscribe();
    service.rechazar(8).subscribe();

    const aceptar = http.expectOne('/api/mas/invitacion/7/aceptar?cliente=true');
    expect(aceptar.request.method).toBe('POST');
    expect(http.expectOne('/api/mas/invitacion/8/rechazar').request.method).toBe('POST');
    http.verify();
  });
});
