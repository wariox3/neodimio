import { Directive, ElementRef, HostListener, inject, Input } from '@angular/core';
import { NgControl } from '@angular/forms';

/**
 * Recorta automáticamente los espacios al inicio y al final del valor de un
 * input de texto o textarea cuando el usuario sale del campo.
 *
 * Se aplica de forma implícita (sin atributo) a los inputs de texto enlazados a
 * un control de formulario, por lo que basta con importar la directiva en el
 * componente. Los inputs de contraseña quedan fuera del selector a propósito.
 *
 * Para desactivarla en un campo concreto: `<input semTrim="false" ... />`
 */
@Directive({
  selector: `
    input[type="text"][formControl], input[type="text"][formControlName], input[type="text"][ngModel],
    input[type="email"][formControl], input[type="email"][formControlName], input[type="email"][ngModel],
    input[type="tel"][formControl], input[type="tel"][formControlName], input[type="tel"][ngModel],
    input[type="search"][formControl], input[type="search"][formControlName], input[type="search"][ngModel],
    input:not([type])[formControl], input:not([type])[formControlName], input:not([type])[ngModel],
    textarea[formControl], textarea[formControlName], textarea[ngModel],
    [semTrim]
  `,
  standalone: true,
})
export class TrimInputDirective {
  private readonly elementRef = inject<ElementRef<HTMLInputElement | HTMLTextAreaElement>>(
    ElementRef,
  );
  private readonly ngControl = inject(NgControl, { optional: true, self: true });

  /** Permite desactivar el recorte en un campo puntual con `semTrim="false"`. */
  @Input()
  set semTrim(value: '' | boolean | 'false') {
    this.enabled = value !== false && value !== 'false';
  }

  private enabled = true;

  @HostListener('blur')
  onBlur(): void {
    if (!this.enabled) return;

    const element = this.elementRef.nativeElement;
    const value = element.value;
    if (typeof value !== 'string') return;

    const trimmed = value.trim();
    if (trimmed === value) return;

    element.value = trimmed;
    this.ngControl?.control?.setValue(trimmed);
  }
}
