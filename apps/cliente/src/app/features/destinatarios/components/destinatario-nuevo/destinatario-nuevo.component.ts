import {
  Component,
  DestroyRef,
  effect,
  inject,
  input,
  model,
  output,
  signal,
  untracked,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { MessageModule } from 'primeng/message';
import { ToastService, trimFormValues } from '@semantica/core';
import { OpcionCatalogo } from '../../../catalogos/models/catalogo.model';
import { Destinatario, DestinatarioNuevo } from '../../models/destinatario.model';
import { DestinatarioService } from '../../services/destinatario.service';
import { DestinatarioCamposComponent } from '../destinatario-campos/destinatario-campos.component';
import {
  crearFormularioDestinatario,
  mensajeDeRechazo,
} from '../destinatario-campos/destinatario.form';

/**
 * Crea un destinatario sin salir de la guía nueva. Solo ofrece CC y NI porque es lo
 * que admite la guía.
 */
@Component({
  selector: 'app-destinatario-nuevo',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    ButtonModule,
    DialogModule,
    MessageModule,
    DestinatarioCamposComponent,
  ],
  templateUrl: './destinatario-nuevo.component.html',
  styleUrl: './destinatario-nuevo.component.scss',
})
export class DestinatarioNuevoComponent {
  private readonly destinatarioService = inject(DestinatarioService);
  private readonly toastService = inject(ToastService);
  private readonly destroyRef = inject(DestroyRef);

  readonly visible = model(false);
  /** Datos ya escritos en la guía, para no digitarlos otra vez. */
  readonly inicial = input<Partial<DestinatarioNuevo>>({});
  readonly creado = output<Destinatario>();

  readonly tiposIdentificacion: OpcionCatalogo[] = [
    { value: 'CC', label: 'CC' },
    { value: 'NI', label: 'NI' },
  ];
  readonly form = crearFormularioDestinatario(inject(FormBuilder));
  readonly guardando = signal(false);
  readonly errorMessage = signal<string | null>(null);

  constructor() {
    // Cada apertura parte de lo que haya en la guía en ese momento.
    effect(() => {
      if (this.visible()) {
        untracked(() => {
          this.form.reset();
          this.form.patchValue(this.inicial());
          this.errorMessage.set(null);
        });
      }
    });
  }

  guardar(): void {
    trimFormValues(this.form);

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.errorMessage.set('Revisa los campos marcados antes de guardar.');
      return;
    }

    this.errorMessage.set(null);
    this.guardando.set(true);
    this.destinatarioService
      .crear(this.form.getRawValue())
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (destinatario) => {
          this.guardando.set(false);
          this.toastService.success('Destinatario creado', 'Quedó seleccionado en la guía.');
          this.creado.emit(destinatario);
          this.visible.set(false);
        },
        error: (err: unknown) => {
          this.guardando.set(false);
          this.errorMessage.set(mensajeDeRechazo(err));
        },
      });
  }
}
