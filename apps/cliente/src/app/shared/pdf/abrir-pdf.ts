import { Observable, catchError, map, throwError } from 'rxjs';

/**
 * Muestra en otra pestaña el PDF que emite `pdf$`; si el navegador la bloquea, lo descarga
 * con `nombre`. Se debe llamar dentro del clic: la pestaña se abre en ese momento, porque
 * abrirla cuando responde la petición la bloquearía el navegador. Si la petición falla, la
 * pestaña se cierra y el error sigue para que la pantalla lo avise.
 */
export function abrirPdf(pdf$: Observable<Blob>, nombre: string): Observable<void> {
  const pestana = window.open('', '_blank');

  return pdf$.pipe(
    map((pdf) => {
      const url = URL.createObjectURL(pdf);
      if (pestana) {
        pestana.location.href = url;
      } else {
        const enlace = document.createElement('a');
        enlace.href = url;
        enlace.download = nombre;
        enlace.click();
      }
      setTimeout(() => URL.revokeObjectURL(url), 60_000);
    }),
    catchError((err: unknown) => {
      pestana?.close();
      return throwError(() => err);
    }),
  );
}
