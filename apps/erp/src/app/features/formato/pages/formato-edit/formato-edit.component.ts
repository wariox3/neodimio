import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { EditorModule } from 'primeng/editor';
import { SkeletonModule } from 'primeng/skeleton';
import { MessageService } from 'primeng/api';
import { FormatoService } from '../../services/formato.service';
import { Formato } from '../../models/formato.model';
import { extractErrorMessage } from '../../../../core';
import { FormatoImagenComponent } from './formato-imagen/formato-imagen.component';

@Component({
  selector: 'app-formato-edit',
  standalone: true,
  imports: [FormsModule, ButtonModule, EditorModule, SkeletonModule, FormatoImagenComponent],
  templateUrl: './formato-edit.component.html',
  styleUrl: './formato-edit.component.scss',
})
export class FormatoEditComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly formatoService = inject(FormatoService);
  private readonly messageService = inject(MessageService);

  readonly formato = signal<Formato | null>(null);
  readonly loading = signal(true);
  readonly saving = signal(false);
  contenido: string | null = null;

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));

    this.formatoService.getFormatoById(id).subscribe({
      next: (formato) => {
        this.formato.set(formato);
        this.contenido = formato.contenido_externo;
        this.loading.set(false);
      },
      error: (err: unknown) => {
        this.loading.set(false);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: extractErrorMessage(err, 'No se pudo cargar el formato.'),
        });
        this.router.navigate(['/dashboard/formato/lista']);
      },
    });
  }

  save(): void {
    const formato = this.formato();
    if (!formato) return;

    this.saving.set(true);
    this.formatoService.updateContenido(formato.codigo_formato_pk, this.contenido).subscribe({
      next: () => {
        this.saving.set(false);
        this.messageService.add({
          severity: 'success',
          summary: 'Guardado',
          detail: 'El contenido del formato fue actualizado.',
        });
        this.router.navigate(['/dashboard/formato/lista']);
      },
      error: (err: unknown) => {
        this.saving.set(false);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: extractErrorMessage(err, 'No se pudo guardar el contenido.'),
        });
      },
    });
  }

  cancel(): void {
    this.router.navigate(['/dashboard/formato/lista']);
  }
}
