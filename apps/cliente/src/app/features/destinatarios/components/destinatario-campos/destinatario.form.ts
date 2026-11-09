import { HttpErrorResponse } from '@angular/common/http';
import { FormBuilder, Validators } from '@angular/forms';
import { extractErrorMessage } from '@semantica/core';

/** Formulario para crear un destinatario, compartido por la página y el diálogo. */
export function crearFormularioDestinatario(fb: FormBuilder) {
  return fb.nonNullable.group({
    codigo_identificacion_fk: ['', Validators.required],
    numero_identificacion: ['', [Validators.required, Validators.maxLength(20)]],
    nombre_corto: ['', [Validators.required, Validators.maxLength(150)]],
    direccion: ['', [Validators.required, Validators.maxLength(200)]],
    telefono: ['', [Validators.required, Validators.maxLength(30)]],
    codigo_ciudad_fk: ['', Validators.required],
  });
}

export type DestinatarioFormGroup = ReturnType<typeof crearFormularioDestinatario>;

/**
 * Mensaje para mostrar cuando fluor rechaza el destinatario, por ejemplo por duplicado.
 * Devuelve `null` con 0, 403, 429 y 500+, porque esos ya los avisa el interceptor.
 */
export function mensajeDeRechazo(err: unknown): string | null {
  if (err instanceof HttpErrorResponse && [400, 404, 409, 422].includes(err.status)) {
    return extractErrorMessage(err, 'No se pudo crear el destinatario.');
  }
  return null;
}
