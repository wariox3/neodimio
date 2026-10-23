import { Component, input, output, signal } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { TabsModule } from 'primeng/tabs';
import { Contenedor } from '../../models/contenedor.model';
import { InvitarFormComponent } from './invitar-form.component';
import { MiembrosListComponent } from './miembros-list.component';

/**
 * Diálogo para invitar usuarios a una empresa y ver sus miembros.
 * Solo se abre para el propietario (`control`) de la empresa.
 */
@Component({
  selector: 'app-invitar-dialog',
  standalone: true,
  imports: [DialogModule, ButtonModule, TabsModule, InvitarFormComponent, MiembrosListComponent],
  templateUrl: './invitar-dialog.component.html',
  styleUrl: './invitar-dialog.component.scss',
})
export class InvitarDialogComponent {
  readonly visible = input(false);
  readonly contenedor = input<Contenedor | null>(null);
  readonly visibleChange = output<boolean>();

  readonly activeTab = signal('miembros');
  readonly miembrosCount = signal<number | null>(null);

  cerrar(): void {
    this.visibleChange.emit(false);
  }
}
