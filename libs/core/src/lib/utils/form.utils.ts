import { AbstractControl, FormArray, FormGroup } from '@angular/forms';

/** Opciones para {@link trimFormValues}. */
export interface TrimFormValuesOptions {
  /**
   * Nombres de controles que no deben recortarse. Por defecto se omite
   * cualquier control cuyo nombre contenga "password", ya que un espacio
   * puede ser parte legítima de una contraseña existente.
   */
  skip?: string[];
}

const DEFAULT_SKIP_PATTERN = /password/i;

/**
 * Recorta (trim) de forma recursiva todos los valores de tipo string de un
 * formulario, incluidos los controles deshabilitados.
 *
 * Se debe invocar al inicio del submit, antes de comprobar `form.invalid`,
 * para que un valor compuesto sólo por espacios falle la validación
 * `Validators.required` en lugar de viajar al backend.
 *
 * @param control Formulario o control a normalizar
 * @param options Controles a excluir del recorte
 */
export function trimFormValues(control: AbstractControl, options?: TrimFormValuesOptions): void {
  const skip = options?.skip;

  if (control instanceof FormGroup) {
    for (const [name, child] of Object.entries(control.controls)) {
      if (skip ? skip.includes(name) : DEFAULT_SKIP_PATTERN.test(name)) continue;
      trimFormValues(child, options);
    }
    return;
  }

  if (control instanceof FormArray) {
    for (const child of control.controls) {
      trimFormValues(child, options);
    }
    return;
  }

  const value = control.value;
  if (typeof value !== 'string') return;

  const trimmed = value.trim();
  if (trimmed === value) return;

  control.setValue(trimmed, { emitEvent: false });
}
