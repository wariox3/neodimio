import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandlerFn,
  HttpRequest,
  HttpResponse,
} from '@angular/common/http';
import { Observable, Subject, of, throwError } from 'rxjs';
import { TokenRefreshService } from '../services/token-refresh.service';
import { AuthServiceContract } from '../tokens';
import { handleUnauthorized } from './error-handlers';

describe('handleUnauthorized', () => {
  const unauthorized = new HttpErrorResponse({ status: 401 });
  const req = new HttpRequest('GET', '/api/tte/guia/lista');
  const ok = new HttpResponse({ status: 200 });

  function setup(refresh: () => Observable<void>, skipUrls: string[] = []) {
    const clearSession = jasmine.createSpy('clearSession');
    const authService = { refresh, clearSession } as unknown as AuthServiceContract;
    const tokenRefresh = new TokenRefreshService();
    const run = (next: HttpHandlerFn, peticion: HttpRequest<unknown> = req) =>
      handleUnauthorized(peticion, next, authService, tokenRefresh, unauthorized, skipUrls);
    return { run, clearSession, tokenRefresh };
  }

  it('reintenta la petición tras renovar el token', (done) => {
    const { run, clearSession, tokenRefresh } = setup(() => of(undefined));
    const next = jasmine.createSpy('next').and.returnValue(of(ok));

    run(next).subscribe({
      complete: () => {
        expect(next).toHaveBeenCalledOnceWith(req);
        expect(clearSession).not.toHaveBeenCalled();
        expect(tokenRefresh.refreshing).toBeFalse();
        done();
      },
    });
  });

  for (const status of [400, 422, 500]) {
    it(`no cierra la sesión si el reintento responde ${status}`, (done) => {
      const { run, clearSession } = setup(() => of(undefined));
      const negocio = new HttpErrorResponse({ status });

      run(() => throwError(() => negocio)).subscribe({
        error: (err) => {
          expect(err).toBe(negocio);
          expect(clearSession).not.toHaveBeenCalled();
          done();
        },
      });
    });
  }

  it('cierra la sesión si el refresh falla, sin reintentar', (done) => {
    const refreshError = new HttpErrorResponse({ status: 401 });
    const { run, clearSession, tokenRefresh } = setup(() => throwError(() => refreshError));
    const next = jasmine.createSpy('next');

    run(next).subscribe({
      error: (err) => {
        expect(err).toBe(refreshError);
        expect(next).not.toHaveBeenCalled();
        expect(clearSession).toHaveBeenCalledTimes(1);
        expect(tokenRefresh.refreshing).toBeFalse();
        done();
      },
    });
  });

  it('no intenta renovar en las URLs excluidas', (done) => {
    const refresh = jasmine.createSpy('refresh');
    const { run } = setup(refresh, ['/auth/seguridad/login']);
    const login = new HttpRequest('GET', '/api/auth/seguridad/login');

    run(() => of(ok), login).subscribe({
      error: (err) => {
        expect(err).toBe(unauthorized);
        expect(refresh).not.toHaveBeenCalled();
        done();
      },
    });
  });

  it('peticiones simultáneas comparten un solo refresh y luego se reintentan', () => {
    const resultado = new Subject<void>();
    const refresh = jasmine.createSpy('refresh').and.returnValue(resultado);
    const { run } = setup(refresh);
    const next = jasmine.createSpy('next').and.returnValue(of(ok as HttpEvent<unknown>));

    run(next).subscribe();
    run(next).subscribe();
    expect(refresh).toHaveBeenCalledTimes(1);
    expect(next).not.toHaveBeenCalled();

    resultado.next();
    expect(next).toHaveBeenCalledTimes(2);
  });

  it('las peticiones en espera fallan si el refresh falla', () => {
    const resultado = new Subject<void>();
    const { run, clearSession } = setup(() => resultado);
    const next = jasmine.createSpy('next');
    const errores: unknown[] = [];

    run(next).subscribe({ error: (e) => errores.push(e) });
    run(next).subscribe({ error: (e) => errores.push(e) });
    resultado.error(new HttpErrorResponse({ status: 401 }));

    expect(errores.length).toBe(2);
    expect(next).not.toHaveBeenCalled();
    expect(clearSession).toHaveBeenCalledTimes(1);
  });
});
