import { Directive, TemplateRef, inject, input } from '@angular/core';

/** Contenido propio de una celda: `<ng-template appDataTableCell="estado" let-row>`. */
@Directive({ selector: 'ng-template[appDataTableCell]', standalone: true })
export class DataTableCellDirective {
  readonly field = input.required<string>({ alias: 'appDataTableCell' });
  readonly template = inject<TemplateRef<unknown>>(TemplateRef);
}

/** Contenido de una fila expandida: `<ng-template appDataTableExpansion let-row>`. */
@Directive({ selector: 'ng-template[appDataTableExpansion]', standalone: true })
export class DataTableExpansionDirective {
  readonly template = inject<TemplateRef<unknown>>(TemplateRef);
}
