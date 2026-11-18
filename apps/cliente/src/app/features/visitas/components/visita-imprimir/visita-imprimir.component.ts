import { Component, DestroyRef, inject, input, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { HttpErrorResponse } from '@angular/common/http';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { ToastService } from '@semantica/core';
import { VisitaService } from '../../services/visita.service';

/**
 * Imprime el formato de la visita (botón "Imprimir" de terbio). El PDF se abre en otra
 * pestaña; con `etiqueta` se muestra como botón con texto, sin ella como ícono de tabla.
 */
@Component({
  selector: 'app-visita-imprimir',
  standalone: true,
  imports: [ButtonModule, TooltipModule],
  template: `
    @if (etiqueta(); as texto) {
      <p-button
        [label]="texto"
        icon="pi pi-print"
        severity="secondary"
        [outlined]="true"
        [loading]="generando()"
        (onClick)="imprimir()"
      />
    } @else {
      <p-button
        icon="pi pi-print"
        severity="secondary"
        [text]="true"
        [rounded]="true"
        pTooltip="Imprimir"
        tooltipPosition="top"
        [ariaLabel]="'Imprimir visita ' + visitaId()"
        [loading]="generando()"
        (onClick)="imprimir()"
      />
    }
  `,
})
export class VisitaImprimirComponent {
  private readonly visitaService = inject(VisitaService);
  private readonly toastService = inject(ToastService);
  private readonly destroyRef = inject(DestroyRef);

  readonly visitaId = input.required<number>();
  /** Texto del botón; si no se indica, se muestra solo el ícono. */
  readonly etiqueta = input<string>();

  readonly generando = signal(false);

  imprimir(): void {
    // La pestaña se abre ya, dentro del clic: abrirla al volver la petición la bloquearía
    // el navegador. Si aun así la bloquea, el PDF se descarga.
    const pestana = window.open('', '_blank');
    this.generando.set(true);

    this.visitaService
      .imprimir(this.visitaId())
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (pdf) => {
          const url = URL.createObjectURL(pdf);
          if (pestana) {
            pestana.location.href = url;
          } else {
            const enlace = document.createElement('a');
            enlace.href = url;
            enlace.download = `visita_${this.visitaId()}.pdf`;
            enlace.click();
          }
          setTimeout(() => URL.revokeObjectURL(url), 60_000);
          this.generando.set(false);
        },
        error: (err: HttpErrorResponse) => {
          pestana?.close();
          this.generando.set(false);
          // El resto de estados ya los avisa el interceptor.
          if (err.status === 404) {
            this.toastService.error('No se pudo imprimir', 'No se encontró la visita.');
          }
        },
      });
  }
}
