# Interface Design System — semantica

Decisiones de interfaz que deben repetirse igual en toda pantalla nueva. Si algo se desvía, es un
bug de consistencia. Los estilos viven en `libs/styles`; reddoc es la referencia de estos patrones.

Convención de textos: solo la primera palabra con mayúscula ("Nueva empresa", no "Nueva Empresa").

## Patrón: modal

Todo `<p-dialog>` nuevo usa `styleClass="app-dialog"`, definido en
`libs/styles/src/primeng/_overlays.scss`: radio de 16px, sombra en capas y paddings propios.

```html
<p-dialog
  [(visible)]="visible"
  [modal]="true"
  [draggable]="false"
  [resizable]="false"
  [dismissableMask]="true"
  [style]="{ width: '620px', maxWidth: '94vw' }"
  styleClass="app-dialog"
>
  <ng-template #header>
    <div class="app-dialog-header">
      <span class="app-dialog-header__icono"><i class="pi pi-folder" aria-hidden="true"></i></span>
      <div class="app-dialog-header__texto">
        <h2 class="app-dialog-header__titulo">Título</h2>
        <p class="app-dialog-header__subtitulo">De qué registro o tarea se trata.</p>
      </div>
    </div>
  </ng-template>

  @if (visible()) {
  <!-- Contenido -->
  }

  <ng-template #footer>
    <p-button
      label="Cerrar"
      severity="secondary"
      [outlined]="true"
      (onClick)="visible.set(false)"
    />
  </ng-template>
</p-dialog>
```

- **Ancho:** fijo en píxeles con tope de `94vw`, para que en móvil no toque los bordes.
- **Contenido bajo `@if (visible())`:** al cerrar no queda el registro anterior a la vista.
- **Datos:** se piden al abrir. La carga, el error con reintento y el vacío van dentro del cuerpo,
  con `app-loading-spinner`, `app-error-alert` y `app-empty-state`.
- **Pie:** en un modal de consulta, solo "Cerrar" (`secondary`, `outlined`). En uno de decisión,
  la secundaria va con `[text]="true"` a la izquierda de la única acción con color.
- **Tablas dentro del modal:** caja con borde y radio de 10px, encabezado pegajoso y scroll propio.
  Bajo 575px se ocultan las columnas secundarias y su dato pasa a una línea bajo la principal.
- **Ubicación:** los overlays se declaran fuera de contenedores flex o grid con `gap`, porque su
  elemento sigue cobrando separación aunque no pinte nada. Un componente que envuelve un
  `<p-dialog>` lleva `:host { display: contents; }`.

## Patrón: menú "Opciones" en una ficha de detalle

Las acciones secundarias de una ficha van en un dropdown junto a "Volver":

- `<p-button label="Opciones" icon="pi pi-chevron-down" iconPos="right" severity="secondary" [outlined]="true" />`,
  visible solo cuando el registro ya cargó.
- `<p-menu [popup]="true" appendTo="body" />` con un modelo de referencia estable (un campo o un
  `computed`, nunca un arreglo armado en la plantilla: un modelo nuevo le hace perder el primer clic).
- Cada entrada abre su propio modal; la ficha solo guarda la señal de visibilidad.
