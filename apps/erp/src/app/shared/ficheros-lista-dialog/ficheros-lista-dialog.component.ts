import { DatePipe } from '@angular/common';
import { HttpErrorResponse, HttpStatusCode } from '@angular/common/http';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  effect,
  inject,
  input,
  model,
  signal,
  untracked,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { finalize } from 'rxjs';
import {
  downloadBlob,
  extractErrorMessage,
  Fichero,
  FicherosService,
  ToastService,
} from '@semantica/core';
import { EmptyStateComponent, ErrorAlertComponent, LoadingSpinnerComponent } from '@semantica/ui';

const UNIDADES_TAMANO = ['B', 'KB', 'MB', 'GB'];

/**
 * Consulta de los ficheros de un registro, con su descarga. La lista se pide al abrir y se
 * descarta al cerrar, para no mostrar los ficheros anteriores mientras llega la respuesta.
 *
 * ```html
 * <app-ficheros-lista-dialog [(visible)]="visible" codigoModelo="TteGuia" [codigo]="id" />
 * ```
 */
@Component({
  selector: 'app-ficheros-lista-dialog',
  standalone: true,
  imports: [
    DatePipe,
    ButtonModule,
    DialogModule,
    EmptyStateComponent,
    ErrorAlertComponent,
    LoadingSpinnerComponent,
  ],
  templateUrl: './ficheros-lista-dialog.component.html',
  styleUrl: './ficheros-lista-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FicherosListaDialogComponent {
  private readonly ficherosService = inject(FicherosService);
  private readonly toastService = inject(ToastService);
  private readonly destroyRef = inject(DestroyRef);

  readonly visible = model(false);
  /** Modelo de fluor, por ejemplo `TteGuia`. */
  readonly codigoModelo = input.required<string>();
  /** Id del registro dentro del modelo. */
  readonly codigo = input.required<number | string>();
  readonly subtitulo = input('Documentos adjuntos a este registro.');

  protected readonly ficheros = signal<readonly Fichero[]>([]);
  protected readonly cargando = signal(false);
  protected readonly error = signal<string | null>(null);
  /** Solo la fila que se descarga muestra el spinner. */
  protected readonly descargandoId = signal<number | null>(null);

  constructor() {
    effect(() => {
      const abierto = this.visible();
      const codigoModelo = this.codigoModelo();
      const codigo = this.codigo();
      untracked(() => {
        this.ficheros.set([]);
        this.error.set(null);
        if (abierto) this.cargar(codigoModelo, codigo);
      });
    });
  }

  protected reintentar(): void {
    this.cargar(this.codigoModelo(), this.codigo());
  }

  protected descargar(fichero: Fichero): void {
    if (this.descargandoId() !== null) return;

    this.descargandoId.set(fichero.codigo_fichero_pk);
    this.ficherosService
      .descargar(fichero.codigo_fichero_pk)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.descargandoId.set(null)),
      )
      .subscribe({
        next: (contenido) => downloadBlob(contenido, this.nombreCompleto(fichero)),
        error: (err: HttpErrorResponse) => {
          // El interceptor ya avisa de los demás errores; un 404 no lo notifica nadie.
          if (err.status === HttpStatusCode.NotFound) {
            this.toastService.error('Fichero no disponible', 'El fichero ya no existe.');
          }
        },
      });
  }

  /** Los ficheros cargados desde el portal ya traen la extensión en el nombre. */
  protected nombreCompleto(fichero: Fichero): string {
    const nombre = fichero.nombre ?? `Fichero ${fichero.codigo_fichero_pk}`;
    const extension = fichero.extension;
    const yaLaTiene = nombre.toLowerCase().endsWith(`.${extension?.toLowerCase()}`);
    return extension && !yaLaTiene ? `${nombre}.${extension}` : nombre;
  }

  protected formatoTamano(bytes: number | null): string {
    if (bytes === null) return '—';
    const potencia = Math.floor(Math.log(Math.max(bytes, 1)) / Math.log(1024));
    const indice = Math.min(potencia, UNIDADES_TAMANO.length - 1);
    const valor = (bytes / 1024 ** indice).toLocaleString('es-CO', { maximumFractionDigits: 1 });
    return `${valor} ${UNIDADES_TAMANO[indice]}`;
  }

  private cargar(codigoModelo: string, codigo: number | string): void {
    this.cargando.set(true);
    this.error.set(null);
    this.ficherosService
      .getFicheros(codigoModelo, String(codigo))
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.cargando.set(false)),
      )
      .subscribe({
        next: (ficheros) => this.ficheros.set(ficheros),
        error: (err: unknown) =>
          this.error.set(extractErrorMessage(err, 'No se pudieron cargar los ficheros.')),
      });
  }
}
