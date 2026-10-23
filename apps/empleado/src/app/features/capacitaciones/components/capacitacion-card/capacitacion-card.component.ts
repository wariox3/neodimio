import { Component, computed, inject, input, output, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Tag } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';
import { CapacitacionDetalle } from '../../models/capacitacion.model';
import { CapacitacionesService } from '../../services/capacitaciones.service';
import { FicherosService, ToastService, TruncatePipe } from '@semantica/core';

@Component({
  selector: 'app-capacitacion-card',
  standalone: true,
  imports: [DatePipe, Tag, ButtonModule, TruncatePipe],
  templateUrl: './capacitacion-card.component.html',
  styleUrl: './capacitacion-card.component.scss',
})
export class CapacitacionCardComponent {
  private readonly capacitacionesService = inject(CapacitacionesService);
  private readonly ficherosService = inject(FicherosService);
  private readonly toastService = inject(ToastService);

  readonly capacitacion = input.required<CapacitacionDetalle>();
  readonly asistenciaConfirmada = output<void>();

  readonly confirming = signal(false);
  readonly expanded = signal(false);

  readonly asistenciaSeverity = computed(() =>
    this.capacitacion().asistencia ? 'success' : 'warn',
  );

  readonly asistenciaLabel = computed(() =>
    this.capacitacion().asistencia ? 'Asistió' : 'Por confirmar',
  );

  readonly contenidoLineas = computed(() =>
    this.capacitacion()
      .capacitacion_contenido.split(/\r?\n/)
      .filter((l) => l.trim().length > 0),
  );

  readonly hasEnlaces = computed(() => this.capacitacion().enlaces.length > 0);

  readonly hasFicheros = computed(() => this.capacitacion().ficheros.length > 0);

  readonly isLugarUrl = computed(() =>
    this.capacitacion().capacitacion_lugar.startsWith('http'),
  );

  readonly evaluacionSeverity = computed((): 'success' | 'warn' | 'danger' | null => {
    const raw = this.capacitacion().evaluacion;
    if (raw === null) return null;
    const val = parseInt(raw, 10);
    if (isNaN(val)) return null;
    if (val >= 70) return 'success';
    if (val >= 50) return 'warn';
    return 'danger';
  });

  readonly evaluacionLabel = computed(() => {
    const raw = this.capacitacion().evaluacion;
    if (raw === null) return '';
    return `${raw} / 100`;
  });

  readonly contenidoIsLong = computed(
    () => this.capacitacion().capacitacion_contenido.length > 120,
  );

  formatSize(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  }

  getExtensionIcon(extension: string): string {
    const ext = extension.toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp'].includes(ext)) return 'pi pi-image';
    if (ext === 'pdf') return 'pi pi-file-pdf';
    if (['doc', 'docx'].includes(ext)) return 'pi pi-file-word';
    if (['xls', 'xlsx'].includes(ext)) return 'pi pi-file-excel';
    return 'pi pi-file';
  }

  toggleExpanded(): void {
    this.expanded.update((v) => !v);
  }

  descargar(pk: number): void {
    this.ficherosService.getDescargarUrl(pk).subscribe(({ url }) => {
      window.open(url, '_blank', 'noopener,noreferrer');
    });
  }

  confirmar(): void {
    const pk = this.capacitacion().codigo_capacitacion_detalle_pk;
    this.confirming.set(true);

    this.capacitacionesService.confirmarAsistencia(pk).subscribe({
      next: () => {
        this.toastService.success('Asistencia confirmada correctamente.');
        this.asistenciaConfirmada.emit();
        this.confirming.set(false);
      },
      error: () => {
        this.confirming.set(false);
      },
    });
  }
}
