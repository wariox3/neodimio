import { Component, computed, inject, input, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { HttpErrorResponse } from '@angular/common/http';
import { catchError, of } from 'rxjs';
import { MenuItem } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { MenuModule } from 'primeng/menu';
import { TooltipModule } from 'primeng/tooltip';
import { ToastService } from '@semantica/core';
import { FormatoImpresion, TipoImpresion } from '../../../catalogos/models/catalogo.model';
import { CatalogoService } from '../../../catalogos/services/catalogo.service';
import { GuiaService } from '../../services/guia.service';

/**
 * Menú para imprimir una guía o su rótulo en los formatos que ofrece la empresa
 * (botones "Formatos" y "Rótulo" de terbio). El PDF se abre en otra pestaña.
 */
@Component({
  selector: 'app-guia-imprimir',
  standalone: true,
  imports: [ButtonModule, MenuModule, TooltipModule],
  template: `
    @if (etiqueta(); as texto) {
      <p-button
        [label]="texto"
        icon="pi pi-print"
        severity="secondary"
        [outlined]="true"
        [loading]="generando()"
        (onClick)="menu.toggle($event)"
      />
    } @else {
      <p-button
        icon="pi pi-print"
        severity="secondary"
        [text]="true"
        [rounded]="true"
        pTooltip="Imprimir"
        tooltipPosition="top"
        [ariaLabel]="'Imprimir guía ' + guiaId()"
        [loading]="generando()"
        (onClick)="menu.toggle($event)"
      />
    }
    <p-menu #menu [model]="items()" [popup]="true" appendTo="body" />
  `,
})
export class GuiaImprimirComponent {
  private readonly catalogoService = inject(CatalogoService);
  private readonly guiaService = inject(GuiaService);
  private readonly toastService = inject(ToastService);

  readonly guiaId = input.required<number>();
  /** Texto del botón; sin él se muestra solo el ícono (filas de una tabla). */
  readonly etiqueta = input<string>();

  readonly generando = signal(false);

  private readonly formatosGuia = toSignal(
    this.catalogoService.formatosImpresion('guia').pipe(catchError(() => of([]))),
    { initialValue: [] as FormatoImpresion[] },
  );
  private readonly formatosRotulo = toSignal(
    this.catalogoService.formatosImpresion('rotulo').pipe(catchError(() => of([]))),
    { initialValue: [] as FormatoImpresion[] },
  );

  readonly items = computed<MenuItem[]>(() => [
    { label: 'Formatos', items: this.opciones('guia', this.formatosGuia(), 'pi pi-file') },
    { label: 'Rótulo', items: this.opciones('rotulo', this.formatosRotulo(), 'pi pi-tag') },
  ]);

  private opciones(tipo: TipoImpresion, formatos: FormatoImpresion[], icon: string): MenuItem[] {
    return formatos.map((formato) => ({
      label: formato.nombre,
      icon,
      command: () => this.imprimir(tipo, formato.codigo),
    }));
  }

  private imprimir(tipo: TipoImpresion, formato: number): void {
    // La pestaña se abre ya, dentro del clic: abrirla al volver la petición la bloquearía
    // el navegador. Si aun así la bloquea, el PDF se descarga.
    const pestana = window.open('', '_blank');
    this.generando.set(true);

    this.guiaService.imprimir(tipo, this.guiaId(), formato).subscribe({
      next: (pdf) => {
        const url = URL.createObjectURL(pdf);
        if (pestana) {
          pestana.location.href = url;
        } else {
          const enlace = document.createElement('a');
          enlace.href = url;
          enlace.download = `${tipo}_${this.guiaId()}.pdf`;
          enlace.click();
        }
        setTimeout(() => URL.revokeObjectURL(url), 60_000);
        this.generando.set(false);
      },
      error: (err: HttpErrorResponse) => {
        pestana?.close();
        this.generando.set(false);
        // El resto de estados ya los avisa el interceptor.
        if (err.status === 400 || err.status === 404) {
          this.toastService.error('No se pudo imprimir', 'Revisa que la guía no esté anulada.');
        }
      },
    });
  }
}
