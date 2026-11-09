import {
  Component,
  DestroyRef,
  effect,
  inject,
  model,
  output,
  signal,
  untracked,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { TableLazyLoadEvent, TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { extractErrorMessage, trimFormValues } from '@semantica/core';
import { TrimInputDirective } from '@semantica/ui';
import { TerceroBuscar } from '../../../catalogos/models/catalogo.model';
import { CatalogoService } from '../../../catalogos/services/catalogo.service';

/** Tamaño de página fijo de `GET /gen/tercero/buscar`. */
const FILAS = 10;

/** Buscador del adquiriente de la guía nueva (`buscarAdquiriente` de terbio). */
@Component({
  selector: 'app-adquiriente-buscar',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    ButtonModule,
    DialogModule,
    InputNumberModule,
    InputTextModule,
    TableModule,
    TagModule,
    TrimInputDirective,
  ],
  templateUrl: './adquiriente-buscar.component.html',
  styleUrl: './adquiriente-buscar.component.scss',
})
export class AdquirienteBuscarComponent {
  private readonly fb = inject(FormBuilder);
  private readonly catalogoService = inject(CatalogoService);
  private readonly destroyRef = inject(DestroyRef);

  readonly visible = model(false);
  readonly seleccionado = output<TerceroBuscar>();

  readonly filas = FILAS;
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly terceros = signal<TerceroBuscar[]>([]);
  readonly totalRecords = signal(0);
  readonly first = signal(0);

  readonly form = this.fb.nonNullable.group({
    nombre_corto: [''],
    numero_identificacion: [''],
    codigo_tercero_pk: [null as number | null],
  });

  constructor() {
    // Cada apertura empieza con la búsqueda limpia.
    effect(() => {
      if (this.visible()) {
        untracked(() => {
          this.form.reset();
          this.buscar();
        });
      }
    });
  }

  buscar(): void {
    trimFormValues(this.form);
    this.first.set(0);
    this.cargar(1);
  }

  onLazyLoad(event: TableLazyLoadEvent): void {
    const first = event.first ?? 0;
    this.first.set(first);
    this.cargar(Math.floor(first / FILAS) + 1);
  }

  seleccionar(tercero: TerceroBuscar): void {
    this.seleccionado.emit(tercero);
    this.visible.set(false);
  }

  private cargar(page: number): void {
    this.loading.set(true);
    this.error.set(null);
    this.catalogoService
      .buscarTerceros({ page, ...this.form.getRawValue() })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.terceros.set(res.items);
          this.totalRecords.set(res.total);
          this.loading.set(false);
        },
        error: (err) => {
          this.error.set(extractErrorMessage(err, 'No se pudieron cargar los terceros.'));
          this.loading.set(false);
        },
      });
  }
}
