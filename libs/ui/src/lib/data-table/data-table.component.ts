import { DecimalPipe, NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  LOCALE_ID,
  TemplateRef,
  computed,
  contentChild,
  contentChildren,
  inject,
  input,
  linkedSignal,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { MenuItem } from 'primeng/api';
import { Menu, MenuModule } from 'primeng/menu';
import { TableModule } from 'primeng/table';
import { TooltipModule } from 'primeng/tooltip';
import { EmptyStateComponent } from '../empty-state/empty-state.component';
import { DataTableCellDirective, DataTableExpansionDirective } from './data-table.directives';
import { formatCellValue } from './data-table.format';
import {
  DATA_TABLE_PAGE_SIZE,
  DataTableColumn,
  DataTableRowAction,
  DataTableRowActionEvent,
} from './data-table.types';

/**
 * Tabla de datos paginada contra el backend. La pantalla declara columnas y acciones, y atiende
 * los eventos; la tabla no conoce HTTP ni dominio.
 *
 * ```html
 * <app-data-table [columns]="columns" [items]="items()" [totalRecords]="total()"
 *   [currentPage]="pagina()" (pageChange)="cargar($event)">
 *   <ng-template appDataTableCell="estado" let-row>...</ng-template>
 * </app-data-table>
 * ```
 */
@Component({
  selector: 'app-data-table',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DecimalPipe,
    NgTemplateOutlet,
    MenuModule,
    TableModule,
    TooltipModule,
    EmptyStateComponent,
  ],
  templateUrl: './data-table.component.html',
  styleUrl: './data-table.component.scss',
})
export class DataTableComponent<T> {
  private readonly locale = inject(LOCALE_ID);

  readonly columns = input.required<readonly DataTableColumn<T>[]>();
  readonly items = input.required<readonly T[]>();
  readonly totalRecords = input(0);
  readonly loading = input(false);
  /** Página actual, empezando en cero. */
  readonly currentPage = input(0);
  readonly pageSize = input(DATA_TABLE_PAGE_SIZE);
  readonly rowActions = input<readonly DataTableRowAction<T>[]>([]);
  readonly dataKey = input('id');
  readonly scrollHeight = input('600px');
  /** Ancho mínimo de la tabla; por debajo, se desplaza en horizontal. */
  readonly tableMinWidth = input<string>();
  /** Nombre en plural de lo que lista la tabla, para el total junto al paginador. */
  readonly recordsLabel = input('registros');
  readonly emptyTitle = input('Sin resultados');
  readonly emptyMessage = input('No se encontraron registros.');
  readonly emptyIcon = input('pi pi-inbox');

  readonly pageChange = output<number>();
  readonly rowAction = output<DataTableRowActionEvent<T>>();

  private readonly rowMenu = viewChild<Menu>('rowMenu');
  private readonly cellDirectives = contentChildren(DataTableCellDirective);
  protected readonly expansion = contentChild(DataTableExpansionDirective);

  /** PrimeNG muta este objeto al expandir; cada carga de filas empieza con todo contraído. */
  protected readonly expandedRows = linkedSignal<readonly T[], Record<string, boolean>>({
    source: this.items,
    computation: () => ({}),
  });
  /** Un solo menú para todas las filas; su contenido se arma al abrirlo. */
  protected readonly rowMenuItems = signal<MenuItem[]>([]);

  /** PrimeNG requiere un arreglo mutable. */
  protected readonly mutableItems = computed(() => [...this.items()]);
  protected readonly cellTemplates = computed(
    () =>
      new Map<string, TemplateRef<unknown>>(
        this.cellDirectives().map((cell) => [cell.field(), cell.template]),
      ),
  );
  protected readonly inlineActions = computed(() => this.rowActions().filter((a) => a.inline));
  protected readonly menuActions = computed(() => this.rowActions().filter((a) => !a.inline));
  protected readonly columnCount = computed(
    () =>
      this.columns().length +
      this.inlineActions().length +
      (this.menuActions().length > 0 ? 1 : 0) +
      (this.expansion() ? 1 : 0),
  );
  protected readonly rangeStart = computed(() => this.currentPage() * this.pageSize() + 1);
  protected readonly rangeEnd = computed(() =>
    Math.min((this.currentPage() + 1) * this.pageSize(), this.totalRecords()),
  );

  /** Un monto o una fecha partidos en dos líneas no se pueden escanear por columna. */
  protected isNowrap(col: DataTableColumn<T>): boolean {
    return col.nowrap === true || (col.type !== undefined && col.type !== 'text');
  }

  protected displayValue(row: T, col: DataTableColumn<T>): string {
    const value = col.value ? col.value(row) : (row as Record<string, unknown>)[col.field];
    return formatCellValue(value, col.type, this.locale);
  }

  protected isActionVisible(action: DataTableRowAction<T>, row: T): boolean {
    return action.visibleFor?.(row) ?? true;
  }

  /** Sin acciones visibles no se pinta el ⋮: un menú que abre vacío es peor que ningún menú. */
  protected hasMenuActions(row: T): boolean {
    return this.menuActions().some((action) => this.isActionVisible(action, row));
  }

  protected invokeAction(action: DataTableRowAction<T>, row: T): void {
    this.rowAction.emit({ actionId: action.id, row });
  }

  protected openRowMenu(event: Event, row: T): void {
    this.rowMenuItems.set(
      this.menuActions()
        .filter((action) => this.isActionVisible(action, row))
        .map((action) => ({
          label: action.label,
          icon: action.icon,
          styleClass: action.severity === 'danger' ? 'data-table-menu-item--danger' : undefined,
          command: () => this.invokeAction(action, row),
        })),
    );
    this.rowMenu()?.toggle(event);
  }

  protected onPage(event: { first?: number; rows?: number }): void {
    const page = Math.floor((event.first ?? 0) / (event.rows ?? this.pageSize()));
    if (page !== this.currentPage()) this.pageChange.emit(page);
  }
}
