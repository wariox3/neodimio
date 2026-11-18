import { definePreset, palette } from '@primeuix/themes';
import Aura from '@primeng/themes/aura';

/** Preset de PrimeNG compartido por todas las apps: Aura con la paleta navy/sky de Semántica. */
export const SemanticaPreset = definePreset(Aura, {
  primitive: {
    navy: palette('#143049'),
    sky: palette('#77aad7'),
  },
  semantic: {
    primary: {
      50: '{navy.50}',
      100: '{navy.100}',
      200: '{navy.200}',
      300: '{navy.300}',
      400: '{navy.400}',
      500: '{navy.500}',
      600: '{navy.600}',
      700: '{navy.700}',
      800: '{navy.800}',
      900: '{navy.900}',
      950: '{navy.950}',
    },
    colorScheme: {
      light: {
        // Bordes tenues teñidos de navy: la estructura se define por líneas, no por contraste.
        content: {
          borderColor: 'rgba(20, 48, 73, 0.12)',
        },
        primary: {
          color: '{navy.500}',
          inverseColor: '#ffffff',
          hoverColor: '{navy.600}',
          activeColor: '{navy.700}',
        },
        highlight: {
          background: '{navy.50}',
          focusBackground: '{navy.100}',
          color: '{navy.700}',
          focusColor: '{navy.800}',
        },
      },
      dark: {
        primary: {
          color: '{sky.400}',
          inverseColor: '{navy.950}',
          hoverColor: '{sky.300}',
          activeColor: '{sky.200}',
        },
        highlight: {
          background: 'rgba(119, 170, 215, 0.16)',
          focusBackground: 'rgba(119, 170, 215, 0.24)',
          color: 'rgba(255, 255, 255, 0.87)',
          focusColor: 'rgba(255, 255, 255, 0.87)',
        },
      },
    },
  },
});

/**
 * Configuración de tema para `providePrimeNG`.
 *
 * PrimeNG emite sus reglas dentro de `@layer primeng`, y en CSS las reglas sin capa ganan sobre
 * las que están en una. Por eso los estándares de `libs/styles/src/primeng/` lo sobrescriben sin
 * pelear especificidad.
 */
export const SEMANTICA_THEME = {
  preset: SemanticaPreset,
  options: {
    darkModeSelector: '.dark-mode',
    cssLayer: { name: 'primeng', order: 'primeng' },
  },
};
