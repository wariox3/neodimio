import { Component, DestroyRef, OnInit, inject, input, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ReactiveFormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TrimInputDirective } from '@semantica/ui';
import { Ciudad, OpcionCatalogo } from '../../../catalogos/models/catalogo.model';
import { CatalogoService } from '../../../catalogos/services/catalogo.service';
import { DestinatarioFormGroup } from './destinatario.form';

/** Campos del destinatario; el formulario y los tipos permitidos los define quien lo usa. */
@Component({
  selector: 'app-destinatario-campos',
  standalone: true,
  imports: [ReactiveFormsModule, InputTextModule, SelectModule, TrimInputDirective],
  templateUrl: './destinatario-campos.component.html',
  styleUrl: './destinatario-campos.component.scss',
})
export class DestinatarioCamposComponent implements OnInit {
  private readonly catalogoService = inject(CatalogoService);
  private readonly destroyRef = inject(DestroyRef);

  readonly form = input.required<DestinatarioFormGroup>();
  readonly tiposIdentificacion = input.required<OpcionCatalogo[]>();

  readonly ciudades = signal<Ciudad[]>([]);

  ngOnInit(): void {
    this.catalogoService
      .ciudades()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((v) => this.ciudades.set(v));
  }

  /** Mensaje de error de un control, o `null` si es válido o no se ha tocado. */
  errorDe(nombre: keyof DestinatarioFormGroup['controls']): string | null {
    const control = this.form().controls[nombre];
    if (!control.touched || control.valid) return null;
    if (control.hasError('required')) return 'Este campo es obligatorio.';
    if (control.hasError('maxlength')) {
      return `Máximo ${control.errors?.['maxlength'].requiredLength} caracteres.`;
    }
    return 'Valor inválido.';
  }
}
