import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { DataTableComponent } from './data-table.component';
import { DataTableCellDirective, DataTableExpansionDirective } from './data-table.directives';
import { DataTableColumn, DataTableRowAction, DataTableRowActionEvent } from './data-table.types';

interface Fila {
  id: number;
  nombre: string | null;
  monto: number | null;
}

const filas = (desde: number): Fila[] =>
  Array.from({ length: 3 }, (_, i) => ({ id: desde + i, nombre: `N${i}`, monto: 1000 }));

@Component({
  standalone: true,
  imports: [DataTableComponent, DataTableCellDirective, DataTableExpansionDirective],
  template: `
    <app-data-table
      dataKey="id"
      recordsLabel="guías"
      [columns]="columns"
      [items]="items()"
      [totalRecords]="total()"
      [currentPage]="page()"
      [rowActions]="actions"
      (pageChange)="pages.push($event)"
      (rowAction)="events.push($event)"
    >
      <ng-template appDataTableCell="propia" let-row>
        <b class="propia">{{ row.id }}</b>
      </ng-template>
      <ng-template appDataTableExpansion let-row>
        <div class="expandida">{{ row.id }}</div>
      </ng-template>
    </app-data-table>
  `,
})
class HostComponent {
  readonly columns: readonly DataTableColumn<Fila>[] = [
    { field: 'nombre', header: 'Nombre' },
    { field: 'monto', header: 'Monto', type: 'currency', align: 'right' },
    { field: 'propia', header: 'Propia' },
  ];
  readonly actions: readonly DataTableRowAction<Fila>[] = [
    { id: 'ver', label: 'Ver', icon: 'pi pi-eye', inline: true },
    { id: 'quitar', label: 'Quitar', icon: 'pi pi-trash', visibleFor: (f) => f.id !== 2 },
  ];
  readonly items = signal<Fila[]>(filas(1));
  readonly total = signal(60);
  readonly page = signal(0);
  readonly pages: number[] = [];
  readonly events: DataTableRowActionEvent<Fila>[] = [];
}

describe('DataTableComponent', () => {
  let fixture: ComponentFixture<HostComponent>;
  let host: HostComponent;
  const el = () => fixture.nativeElement as HTMLElement;
  const render = async () => {
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  };
  const filasDom = () => el().querySelectorAll<HTMLTableRowElement>('.p-datatable-tbody > tr');
  const conteo = () => el().querySelector('.data-table__count')?.textContent?.replace(/\s+/g, ' ');

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HostComponent],
      providers: [provideNoopAnimations()],
    }).compileComponents();
    fixture = TestBed.createComponent(HostComponent);
    host = fixture.componentInstance;
    await render();
  });

  it('muestra el rango y el total, y no ofrece selector de filas', async () => {
    expect(conteo()).toContain('1–25 de 60 guías');
    host.page.set(1);
    await render();
    expect(conteo()).toContain('26–50 de 60 guías');
    expect(el().querySelector('.p-paginator-rpp-dropdown')).toBeNull();
  });

  it('avisa la página nueva empezando en cero', async () => {
    el().querySelector<HTMLElement>('.p-paginator-next')?.click();
    await render();
    expect(host.pages).toEqual([1]);
  });

  it('formatea según el tipo y usa la plantilla propia de la celda', () => {
    const celdas = filasDom()[0].cells;
    expect(celdas[2].textContent).toContain('$ 1,000');
    expect(celdas[3].querySelector('.propia')?.textContent).toBe('1');
  });

  it('marca con guion el valor nulo', async () => {
    host.items.set([{ id: 9, nombre: null, monto: null }]);
    await render();
    expect(filasDom()[0].cells[1].textContent?.trim()).toBe('—');
  });

  it('emite la acción de fila con su fila', () => {
    el().querySelector<HTMLElement>('[aria-label="Ver"]')?.click();
    expect(host.events).toEqual([{ actionId: 'ver', row: host.items()[0] }]);
  });

  it('no pinta el menú en filas sin acciones visibles', () => {
    const conMenu = (i: number) => filasDom()[i].querySelector('[aria-label="Más acciones"]');
    expect(conMenu(0)).not.toBeNull();
    expect(conMenu(1)).toBeNull();
  });

  it('expande una fila y la contrae al llegar filas nuevas', async () => {
    el().querySelector<HTMLElement>('[aria-label="Expandir fila"]')?.click();
    await render();
    expect(el().querySelector('.expandida')?.textContent).toBe('1');

    host.items.set(filas(1));
    await render();
    expect(el().querySelector('.expandida')).toBeNull();
  });

  it('muestra el aviso de vacío cuando no hay filas', async () => {
    host.items.set([]);
    await render();
    expect(el().querySelector('app-empty-state')).not.toBeNull();
  });
});
