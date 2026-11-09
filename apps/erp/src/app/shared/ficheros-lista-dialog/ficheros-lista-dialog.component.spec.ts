import { HttpErrorResponse } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { of, throwError } from 'rxjs';
import { Fichero, FicherosService, ToastService } from '@semantica/core';
import { FicherosListaDialogComponent } from './ficheros-lista-dialog.component';

const fichero = (parcial: Partial<Fichero>): Fichero =>
  ({ codigo_fichero_pk: 7, nombre: 'cumplido', extension: 'pdf', ...parcial }) as Fichero;

describe('FicherosListaDialogComponent', () => {
  let fixture: ComponentFixture<FicherosListaDialogComponent>;
  let service: jasmine.SpyObj<FicherosService>;
  let toast: jasmine.SpyObj<ToastService>;
  let nombreDescargado: string | null;

  const abrir = () => {
    fixture.componentRef.setInput('visible', true);
    fixture.detectChanges();
  };
  const descargar = (f: Fichero) => fixture.componentInstance['descargar'](f);

  beforeEach(async () => {
    service = jasmine.createSpyObj<FicherosService>('FicherosService', [
      'getFicheros',
      'descargar',
    ]);
    service.getFicheros.and.returnValue(of([]));
    service.descargar.and.returnValue(of(new Blob(['x'])));
    toast = jasmine.createSpyObj<ToastService>('ToastService', ['error']);
    nombreDescargado = null;
    spyOn(HTMLAnchorElement.prototype, 'click').and.callFake(function (this: HTMLAnchorElement) {
      nombreDescargado = this.download;
    });

    await TestBed.configureTestingModule({
      imports: [FicherosListaDialogComponent],
      providers: [
        provideNoopAnimations(),
        { provide: FicherosService, useValue: service },
        { provide: ToastService, useValue: toast },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(FicherosListaDialogComponent);
    fixture.componentRef.setInput('codigoModelo', 'TteGuia');
    fixture.componentRef.setInput('codigo', 53483);
    fixture.detectChanges();
  });

  it('no consulta hasta que se abre', () => {
    expect(service.getFicheros).not.toHaveBeenCalled();
  });

  it('al abrir consulta los ficheros del registro', () => {
    abrir();
    expect(service.getFicheros).toHaveBeenCalledOnceWith('TteGuia', '53483');
  });

  it('descarga con el nombre y la extensión del fichero', () => {
    descargar(fichero({}));
    expect(service.descargar).toHaveBeenCalledOnceWith(7);
    expect(nombreDescargado).toBe('cumplido.pdf');
  });

  it('no repite la extensión si el nombre ya la trae', () => {
    descargar(fichero({ nombre: 'cumplido.PDF' }));
    expect(nombreDescargado).toBe('cumplido.PDF');
  });

  it('avisa cuando el fichero ya no existe', () => {
    service.descargar.and.returnValue(throwError(() => new HttpErrorResponse({ status: 404 })));
    descargar(fichero({}));
    expect(toast.error).toHaveBeenCalledTimes(1);
  });

  it('no duplica el aviso de los errores que maneja el interceptor', () => {
    service.descargar.and.returnValue(throwError(() => new HttpErrorResponse({ status: 502 })));
    descargar(fichero({}));
    expect(toast.error).not.toHaveBeenCalled();
  });
});
