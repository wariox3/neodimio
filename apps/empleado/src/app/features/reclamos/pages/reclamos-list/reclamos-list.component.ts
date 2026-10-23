import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DatePipe } from '@angular/common';
import {
  PageHeaderComponent,
  LoadingSpinnerComponent,
  EmptyStateComponent,
  ErrorAlertComponent,
} from '../../../../shared';
import { ReclamosService } from '../../services/reclamos.service';
import { Reclamo, ReclamoRespuesta } from '../../models/reclamo.model';
import { extractErrorMessage } from '@semantica/core';
import { TableLazyLoadEvent, TableModule, TableRowExpandEvent } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { AuthService } from '../../../auth/services/auth.service';
import { ReclamoCreateDialogComponent } from '../../components/reclamo-create-dialog/reclamo-create-dialog.component';
import { FicherosDialogComponent } from '@semantica/ui';

@Component({
  selector: 'app-reclamos-list',
  standalone: true,
  imports: [
    PageHeaderComponent,
    LoadingSpinnerComponent,
    EmptyStateComponent,
    ErrorAlertComponent,
    TableModule,
    ButtonModule,
    TagModule,
    TooltipModule,
    DatePipe,
    ReclamoCreateDialogComponent,
    FicherosDialogComponent,
  ],
  templateUrl: './reclamos-list.component.html',
  styleUrl: './reclamos-list.component.scss',
})
export class ReclamosListComponent implements OnInit {
  private readonly reclamosService = inject(ReclamosService);
  private readonly authService = inject(AuthService);
  private readonly destroyRef = inject(DestroyRef);

  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly reclamos = signal<Reclamo[]>([]);
  readonly totalRecords = signal(0);
  readonly pageSize = signal(50);
  readonly first = signal(0);
  readonly dialogVisible = signal(false);
  readonly ficherosDialogVisible = signal(false);
  readonly selectedReclamoId = signal(0);
  readonly expandedRows = signal<Record<string, boolean>>({});

  readonly respuestasCache = signal<Map<number, ReclamoRespuesta[]>>(new Map());
  readonly respuestasLoading = signal<Set<number>>(new Set());
  readonly respuestasError = signal<Map<number, string>>(new Map());

  ngOnInit(): void {
    this.loadReclamos(1);
  }

  loadReclamos(page: number): void {
    const user = this.authService.currentUser();

    if (!user) {
      this.loading.set(false);
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    this.reclamosService
      .getReclamos({ page, size: this.pageSize(), empleado_id: user.empleado_id! })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.reclamos.set(res.items);
          this.totalRecords.set(res.total);
          this.loading.set(false);
        },
        error: (err) => {
          this.error.set(extractErrorMessage(err, 'No se pudieron cargar los reclamos.'));
          this.loading.set(false);
        },
      });
  }

  onLazyLoad(event: TableLazyLoadEvent): void {
    const first = event.first ?? 0;
    const rows = event.rows ?? this.pageSize();
    this.first.set(first);
    this.pageSize.set(rows);
    this.loadReclamos(Math.floor(first / rows) + 1);
  }

  onNuevo(): void {
    this.dialogVisible.set(true);
  }

  onReclamoCreated(): void {
    this.loadReclamos(1);
  }

  onAdjuntos(reclamo: Reclamo): void {
    this.selectedReclamoId.set(reclamo.codigo_reclamo_pk);
    this.ficherosDialogVisible.set(true);
  }

  onRowExpand(event: TableRowExpandEvent): void {
    const reclamo = event.data as Reclamo;
    const id = reclamo.codigo_reclamo_pk;

    if (this.respuestasCache().has(id)) return;

    this.fetchRespuestas(id);
  }

  retryLoadRespuestas(reclamo: Reclamo): void {
    const id = reclamo.codigo_reclamo_pk;
    const errorMap = new Map(this.respuestasError());
    errorMap.delete(id);
    this.respuestasError.set(errorMap);
    this.fetchRespuestas(id);
  }

  private fetchRespuestas(id: number): void {
    const loadingSet = new Set(this.respuestasLoading());
    loadingSet.add(id);
    this.respuestasLoading.set(loadingSet);

    this.reclamosService
      .getRespuestas(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
      next: (res) => {
        const cache = new Map(this.respuestasCache());
        cache.set(id, res.items);
        this.respuestasCache.set(cache);

        const loading = new Set(this.respuestasLoading());
        loading.delete(id);
        this.respuestasLoading.set(loading);
      },
      error: (err) => {
        const loading = new Set(this.respuestasLoading());
        loading.delete(id);
        this.respuestasLoading.set(loading);

        const errorMap = new Map(this.respuestasError());
        errorMap.set(id, extractErrorMessage(err, 'No se pudieron cargar las respuestas.'));
        this.respuestasError.set(errorMap);
      },
    });
  }

  getEstado(reclamo: Reclamo): {
    label: string;
    severity: 'success' | 'info' | 'warn' | 'secondary' | 'contrast' | 'danger';
  } {
    if (reclamo.estado_anulado) return { label: 'Anulado', severity: 'danger' };
    if (reclamo.estado_cerrado) return { label: 'Cerrado', severity: 'secondary' };
    if (reclamo.estado_atendido) return { label: 'Atendido', severity: 'success' };
    if (reclamo.estado_aprobado) return { label: 'Aprobado', severity: 'info' };
    if (reclamo.estado_autorizado) return { label: 'Autorizado', severity: 'warn' };
    return { label: 'Pendiente', severity: 'contrast' };
  }
}
