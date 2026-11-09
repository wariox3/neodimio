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
import { extractErrorMessage, trimFormValues } from '@semantica/core';
import { TrimInputDirective } from '@semantica/ui';
import { Destinatario } from '../../models/destinatario.model';
import { DestinatarioService } from '../../services/destinatario.service';

const FILAS = 10;

/** Buscador de destinatarios de la guía nueva (`buscarDestinatario` de terbio). */
@Component({
  selector: 'app-destinatario-buscar',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    ButtonModule,
    DialogModule,
    InputNumberModule,
    InputTextModule,
    TableModule,
    TrimInputDirective,
  ],
  templateUrl: './destinatario-buscar.component.html',
  styleUrl: './destinatario-buscar.component.scss',
})
export class DestinatarioBuscarComponent {
  private readonly fb = inject(FormBuilder);
  private readonly destinatarioService = inject(DestinatarioService);
  private readonly destroyRef = inject(DestroyRef);

  readonly visible = model(false);
  readonly seleccionado = output<Destinatario>();

  readonly filas = FILAS;
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly destinatarios = signal<Destinatario[]>([]);
  readonly totalRecords = signal(0);
  readonly first = signal(0);

  readonly form = this.fb.nonNullable.group({
    nombre_corto: [''],
    numero_identificacion: [''],
    codigo_destinatario_pk: [null as number | null],
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

  seleccionar(destinatario: Destinatario): void {
    this.seleccionado.emit(destinatario);
    this.visible.set(false);
  }

  private cargar(page: number): void {
    this.loading.set(true);
    this.error.set(null);
    this.destinatarioService
      .listar({ page, size: FILAS, ...this.form.getRawValue() })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.destinatarios.set(res.items);
          this.totalRecords.set(res.total);
          this.loading.set(false);
        },
        error: (err) => {
          this.error.set(extractErrorMessage(err, 'No se pudieron cargar los destinatarios.'));
          this.loading.set(false);
        },
      });
  }
}
