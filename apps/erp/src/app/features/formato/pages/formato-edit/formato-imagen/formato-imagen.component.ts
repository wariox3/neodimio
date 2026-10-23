import { UpperCasePipe } from '@angular/common';
import { Component, OnInit, inject, input, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputNumberModule } from 'primeng/inputnumber';
import { CheckboxModule } from 'primeng/checkbox';
import { DialogModule } from 'primeng/dialog';
import { FileUploadModule } from 'primeng/fileupload';
import { ProgressBarModule } from 'primeng/progressbar';
import { SkeletonModule } from 'primeng/skeleton';
import { TooltipModule } from 'primeng/tooltip';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { FormatoImagenService } from '../../../services/formato-imagen.service';
import { FormatoImagen } from '../../../models/formato-imagen.model';
import { extractErrorMessage } from '../../../../../core';

@Component({
  selector: 'app-formato-imagen',
  standalone: true,
  imports: [
    UpperCasePipe,
    FormsModule,
    ButtonModule,
    InputNumberModule,
    CheckboxModule,
    DialogModule,
    FileUploadModule,
    ProgressBarModule,
    SkeletonModule,
    TooltipModule,
    ConfirmDialogModule,
  ],
  providers: [ConfirmationService],
  templateUrl: './formato-imagen.component.html',
  styleUrl: './formato-imagen.component.scss',
})
export class FormatoImagenComponent implements OnInit {
  private readonly formatoImagenService = inject(FormatoImagenService);
  private readonly messageService = inject(MessageService);
  private readonly confirmationService = inject(ConfirmationService);

  readonly codigoFormato = input.required<number>();

  readonly imagenes = signal<FormatoImagen[]>([]);
  readonly loading = signal(true);
  readonly uploading = signal(false);
  readonly savingImageId = signal<number | null>(null);
  readonly dialogVisible = signal(false);
  readonly deleting = signal<number | null>(null);
  readonly selectedFile = signal<File | null>(null);
  readonly selectedFilePreview = signal<string | null>(null);


  newPosicionX = 0;
  newPosicionY = 0;
  newAncho = 50;
  newAlto = 30;
  newVisualizarUltimaPagina = false;

  ngOnInit(): void {
    this.loadImagenes();
  }

  openDialog(): void {
    this.resetUploadForm();
    this.dialogVisible.set(true);
  }

  closeDialog(): void {
    this.dialogVisible.set(false);
    this.resetUploadForm();
  }

  onSelect(event: { files: File[] }): void {
    const file = event.files[0];
    if (!file) return;

    this.selectedFile.set(file);

    const reader = new FileReader();
    reader.onload = () => this.selectedFilePreview.set(reader.result as string);
    reader.readAsDataURL(file);
  }

  onClear(): void {
    this.selectedFile.set(null);
    this.selectedFilePreview.set(null);
  }

  submitUpload(): void {
    const file = this.selectedFile();
    if (!file) return;

    this.uploading.set(true);

    this.formatoImagenService
      .crearImagen({
        codigo_formato_fk: this.codigoFormato(),
        posicion_x: this.newPosicionX,
        posicion_y: this.newPosicionY,
        ancho: this.newAncho,
        alto: this.newAlto,
        visualizar_ultima_pagina: this.newVisualizarUltimaPagina,
        imagen: file,
      })
      .subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Imagen cargada',
            detail: 'La imagen se subió correctamente.',
          });
          this.uploading.set(false);
          this.closeDialog();
          this.loadImagenes();
        },
        error: (err: unknown) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: extractErrorMessage(err, 'No se pudo cargar la imagen.'),
          });
          this.uploading.set(false);
        },
      });
  }

  confirmarEliminar(imagen: FormatoImagen): void {
    this.confirmationService.confirm({
      message: '¿Eliminar esta imagen? Esta acción no se puede deshacer.',
      header: 'Eliminar imagen',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Eliminar',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => this.eliminarImagen(imagen),
    });
  }

  eliminarImagen(imagen: FormatoImagen): void {
    this.deleting.set(imagen.codigo_formato_imagen_pk);

    this.formatoImagenService.eliminarImagen(imagen.codigo_formato_imagen_pk).subscribe({
      next: () => {
        this.imagenes.update((list) =>
          list.filter((i) => i.codigo_formato_imagen_pk !== imagen.codigo_formato_imagen_pk),
        );
        this.messageService.add({
          severity: 'success',
          summary: 'Eliminada',
          detail: 'La imagen fue eliminada correctamente.',
        });
        this.deleting.set(null);
      },
      error: (err: unknown) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: extractErrorMessage(err, 'No se pudo eliminar la imagen.'),
        });
        this.deleting.set(null);
      },
    });
  }

  guardarCambios(imagen: FormatoImagen): void {
    this.savingImageId.set(imagen.codigo_formato_imagen_pk);

    this.formatoImagenService
      .actualizarImagen(imagen.codigo_formato_imagen_pk, {
        posicion_x: imagen.posicion_x,
        posicion_y: imagen.posicion_y,
        ancho: imagen.ancho,
        alto: imagen.alto,
        visualizar_ultima_pagina: imagen.visualizar_ultima_pagina,
      })
      .subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Actualizado',
            detail: 'La imagen fue actualizada correctamente.',
          });
          this.savingImageId.set(null);
        },
        error: (err: unknown) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: extractErrorMessage(err, 'No se pudo actualizar la imagen.'),
          });
          this.savingImageId.set(null);
        },
      });
  }

  formatSize(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  }

  getPreview(imagen: FormatoImagen): string | null {
    if (!imagen.imagen) return null;
    return `data:image/${imagen.extension};base64,${imagen.imagen}`;
  }

  private loadImagenes(): void {
    this.loading.set(true);

    this.formatoImagenService.getImagenes(this.codigoFormato()).subscribe({
      next: (imagenes) => {
        this.imagenes.set(imagenes);
        this.loading.set(false);
      },
      error: (err: unknown) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: extractErrorMessage(err, 'No se pudieron cargar las imágenes.'),
        });
        this.loading.set(false);
      },
    });
  }

  private resetUploadForm(): void {
    this.selectedFile.set(null);
    this.selectedFilePreview.set(null);
    this.newPosicionX = 0;
    this.newPosicionY = 0;
    this.newAncho = 50;
    this.newAlto = 30;
    this.newVisualizarUltimaPagina = false;
  }
}
