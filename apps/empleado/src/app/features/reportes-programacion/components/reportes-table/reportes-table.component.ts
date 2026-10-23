import { Component, inject, input, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { TableModule, TableLazyLoadEvent, TableRowExpandEvent } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { ProgramacionReporte, ProgramacionReporteRespuesta } from '../../models/reporte-programacion.model';
import { ReportesProgramacionService } from '../../services/reportes-programacion.service';
import { extractErrorMessage } from '@semantica/core';

@Component({
  selector: 'app-reportes-table',
  standalone: true,
  imports: [TableModule, ButtonModule, TagModule, DatePipe],
  templateUrl: './reportes-table.component.html',
  styleUrl: './reportes-table.component.scss',
})
export class ReportesTableComponent {
  private readonly reportesService = inject(ReportesProgramacionService);

  readonly empleadoId = input.required<number>();

  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly reportes = signal<ProgramacionReporte[]>([]);
  readonly totalRecords = signal(0);
  readonly pageSize = signal(10);
  readonly first = signal(0);

  readonly expandedRows = signal<Record<string, boolean>>({});
  readonly respuestasCache = signal<Map<number, ProgramacionReporteRespuesta[]>>(new Map());
  readonly respuestasLoading = signal<Set<number>>(new Set());
  readonly respuestasError = signal<Map<number, string>>(new Map());

  loadReportes(page: number): void {
    this.loading.set(true);
    this.error.set(null);

    this.reportesService.getReportes(this.empleadoId(), page, this.pageSize()).subscribe({
      next: (res) => {
        this.reportes.set(res.items);
        this.totalRecords.set(res.total);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(extractErrorMessage(err, 'No se pudieron cargar los reportes.'));
        this.loading.set(false);
      },
    });
  }

  onLazyLoad(event: TableLazyLoadEvent): void {
    const page = Math.floor((event.first ?? 0) / this.pageSize()) + 1;
    this.first.set(event.first ?? 0);
    this.loadReportes(page);
  }

  onRowExpand(event: TableRowExpandEvent): void {
    const reporte = event.data as ProgramacionReporte;
    const id = reporte.codigo_programacion_reporte_pk;

    if (this.respuestasCache().has(id)) return;

    this.fetchRespuestas(id);
  }

  retryLoadRespuestas(reporte: ProgramacionReporte): void {
    const id = reporte.codigo_programacion_reporte_pk;
    const errorMap = new Map(this.respuestasError());
    errorMap.delete(id);
    this.respuestasError.set(errorMap);
    this.fetchRespuestas(id);
  }

  getEstado(reporte: ProgramacionReporte): { label: string; severity: string } {
    if (reporte.estado_anulado) return { label: 'Anulado', severity: 'danger' };
    if (reporte.estado_cerrado) return { label: 'Cerrado', severity: 'secondary' };
    if (reporte.estado_atendido) return { label: 'Atendido', severity: 'success' };
    if (reporte.estado_aprobado) return { label: 'Aprobado', severity: 'info' };
    if (reporte.estado_autorizado) return { label: 'Autorizado', severity: 'warn' };
    return { label: 'Pendiente', severity: 'contrast' };
  }

  private fetchRespuestas(id: number): void {
    const loadingSet = new Set(this.respuestasLoading());
    loadingSet.add(id);
    this.respuestasLoading.set(loadingSet);

    this.reportesService.getRespuestasReporte(id).subscribe({
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
}
