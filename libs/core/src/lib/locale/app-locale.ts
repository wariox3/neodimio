import { registerLocaleData } from '@angular/common';
import localeEsCo from '@angular/common/locales/es-CO';
import { LOCALE_ID, Provider } from '@angular/core';

/** Formato de números y fechas de todas las apps: `$ 1.500.000`. */
export const APP_LOCALE = 'es-CO';

registerLocaleData(localeEsCo);

/** Hace que los pipes de Angular (`number`, `currency`, `date`) usen el formato colombiano. */
export function provideAppLocale(): Provider {
  return { provide: LOCALE_ID, useValue: APP_LOCALE };
}
