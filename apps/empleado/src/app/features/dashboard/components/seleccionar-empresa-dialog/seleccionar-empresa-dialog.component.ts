import { Component, input, model, output } from '@angular/core';
import { DialogModule } from 'primeng/dialog';
import { Membresia } from '../../models/membresia.model';

/**
 * Modal para elegir con qué empresa trabajar. Tras el login es obligatorio
 * (`closable` en falso); desde el menú del usuario se puede cerrar.
 */
@Component({
  selector: 'app-seleccionar-empresa-dialog',
  standalone: true,
  imports: [DialogModule],
  templateUrl: './seleccionar-empresa-dialog.component.html',
  styleUrl: './seleccionar-empresa-dialog.component.scss',
})
export class SeleccionarEmpresaDialogComponent {
  readonly visible = model(false);
  readonly membresias = input.required<Membresia[]>();
  /** Empresa elegida actualmente, para marcarla en la lista. */
  readonly actualId = input<number | null>(null);
  readonly closable = input(true);
  readonly seleccionada = output<Membresia>();

  nombre(membresia: Membresia): string {
    return membresia.tenant_nombre?.trim() || `Empresa ${membresia.tenant_id}`;
  }

  inicial(membresia: Membresia): string {
    return this.nombre(membresia).charAt(0).toUpperCase();
  }

  seleccionar(membresia: Membresia): void {
    if (!membresia.activo) return;
    this.seleccionada.emit(membresia);
  }
}
