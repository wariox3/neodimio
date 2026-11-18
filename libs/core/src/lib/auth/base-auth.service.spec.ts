import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Injector, runInInjectionContext } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { BaseUsuario } from '../models/auth.model';
import { ENVIRONMENT } from '../tokens';
import { AuthApiEndpoints, BaseAuthService } from './base-auth.service';

class AuthDePrueba extends BaseAuthService<BaseUsuario> {
  protected readonly apiEndpoints = { me: '/me' } as AuthApiEndpoints;
  protected readonly loginRoute = '/login';
}

describe('BaseAuthService', () => {
  const usuario: BaseUsuario = { id: 1, email: 'a@b.co', role: 'user' };
  let http: HttpTestingController;
  let navigate: jasmine.Spy;
  let auth: AuthDePrueba;

  const responderMe = (body: BaseUsuario | string, status = 200) =>
    http.expectOne('/api/me').flush(body, { status, statusText: 'x' });

  beforeEach(() => {
    navigate = jasmine.createSpy('navigate');
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: ENVIRONMENT, useValue: { apiUrl: '/api' } },
        { provide: Router, useValue: { navigate } },
      ],
    });
    http = TestBed.inject(HttpTestingController);
    auth = runInInjectionContext(TestBed.inject(Injector), () => new AuthDePrueba());
  });

  afterEach(() => http.verify());

  function iniciarSesion(): void {
    auth.me().subscribe();
    responderMe(usuario);
  }

  it('me() con 401 significa que no hay sesión', () => {
    iniciarSesion();
    let resultado: BaseUsuario | null | undefined;
    auth.me().subscribe((u) => (resultado = u));
    responderMe('', 401);
    expect(resultado).toBeNull();
    expect(auth.isAuthenticated()).toBeFalse();
  });

  for (const status of [0, 500]) {
    it(`me() con un fallo ${status} no cierra la sesión visible`, () => {
      iniciarSesion();
      let fallo: unknown;
      auth.me().subscribe({ error: (e) => (fallo = e) });
      http.expectOne('/api/me').error(new ProgressEvent('x'), { status, statusText: 'x' });
      expect(fallo).toBeDefined();
      expect(auth.isAuthenticated()).toBeTrue();
    });
  }

  it('clearSession lleva al login si había sesión', () => {
    iniciarSesion();
    auth.clearSession();
    expect(auth.isAuthenticated()).toBeFalse();
    expect(navigate).toHaveBeenCalledOnceWith(['/login']);
  });

  it('clearSession no mueve a un visitante sin sesión', () => {
    auth.clearSession();
    expect(navigate).not.toHaveBeenCalled();
  });
});
