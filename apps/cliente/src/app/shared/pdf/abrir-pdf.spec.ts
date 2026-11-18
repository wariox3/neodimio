import { Subject } from 'rxjs';
import { abrirPdf } from './abrir-pdf';

describe('abrirPdf', () => {
  it('abre la pestaña al llamarse y le carga el PDF cuando llega', () => {
    const pestana = { location: { href: '' }, close: jasmine.createSpy('close') };
    spyOn(window, 'open').and.returnValue(pestana as unknown as Window);
    spyOn(URL, 'createObjectURL').and.returnValue('blob:pdf');
    const pdf$ = new Subject<Blob>();

    abrirPdf(pdf$, 'recibo.pdf').subscribe();
    expect(window.open).toHaveBeenCalledWith('', '_blank');

    pdf$.next(new Blob());
    expect(pestana.location.href).toBe('blob:pdf');
  });

  it('cierra la pestaña y deja pasar el error si la petición falla', () => {
    const pestana = { location: { href: '' }, close: jasmine.createSpy('close') };
    spyOn(window, 'open').and.returnValue(pestana as unknown as Window);
    const pdf$ = new Subject<Blob>();
    let error: unknown;

    abrirPdf(pdf$, 'recibo.pdf').subscribe({ error: (e) => (error = e) });
    pdf$.error(new Error('404'));

    expect(pestana.close).toHaveBeenCalled();
    expect(error).toEqual(new Error('404'));
  });
});
