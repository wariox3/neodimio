import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CurrencyPipe, DatePipe } from '@angular/common';
import {
  PageHeaderComponent,
  LoadingSpinnerComponent,
  EmptyStateComponent,
  ErrorAlertComponent,
} from '../../../../shared';
import { PagosService } from '../../services/pagos.service';
import { Pago } from '../../models/pago.model';
import { downloadBlob, extractErrorMessage, ToastService } from '@semantica/core';
import { TableLazyLoadEvent, TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { AuthService } from '../../../auth/services/auth.service';

@Component({
  selector: 'app-pagos-list',
  standalone: true,
  imports: [
    PageHeaderComponent,
    LoadingSpinnerComponent,
    EmptyStateComponent,
    ErrorAlertComponent,
    TableModule,
    ButtonModule,
    DatePipe,
    CurrencyPipe,
  ],
  templateUrl: './pagos-list.component.html',
  styleUrl: './pagos-list.component.scss',
})
export class PagosListComponent implements OnInit {
  private readonly pagosService = inject(PagosService);
  private readonly authService = inject(AuthService);
  private readonly toastService = inject(ToastService);
  private readonly destroyRef = inject(DestroyRef);

  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly pagos = signal<Pago[]>([]);
  readonly totalRecords = signal(0);
  readonly pageSize = signal(50);
  readonly first = signal(0);
  readonly printing = signal<number | null>(null);

  ngOnInit(): void {
    this.loadPagos(1);
  }

  loadPagos(page: number): void {
    const user = this.authService.currentUser();

    if (!user) {
      this.loading.set(false);
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    this.pagosService
      .getPagos({ page, size: this.pageSize(), empleado_id: user.empleado_id! })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.pagos.set(res.items);
          this.totalRecords.set(res.total);
          this.loading.set(false);
        },
        error: (err) => {
          this.error.set(extractErrorMessage(err, 'No se pudieron cargar los pagos.'));
          this.loading.set(false);
        },
      });
  }

  onLazyLoad(event: TableLazyLoadEvent): void {
    const first = event.first ?? 0;
    const rows = event.rows ?? this.pageSize();
    this.first.set(first);
    this.pageSize.set(rows);
    this.loadPagos(Math.floor(first / rows) + 1);
  }

  imprimirPago(pago: Pago): void {
    this.printing.set(pago.codigo_pago_pk);

    this.pagosService
      .imprimirPago(pago.codigo_pago_pk)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (blob) => {
          downloadBlob(blob, `pago-${pago.codigo_pago_pk}.pdf`);
          this.printing.set(null);
        },
        error: (err) => {
          this.toastService.error(extractErrorMessage(err, 'No se pudo imprimir el pago.'));
          this.printing.set(null);
        },
      });
  }
}
