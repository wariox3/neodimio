import { Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { extractErrorMessage } from '@semantica/core';
import {
  ArchivosComponent,
  ErrorAlertComponent,
  LoadingSpinnerComponent,
  PageHeaderComponent,
} from '../../../../shared';
import {
  InformacionCliente,
  MODELO_TERCERO,
  identificacionCliente,
} from '../../models/informacion.model';
import { InformacionService } from '../../services/informacion.service';

/**
 * Información del cliente (`cliente_general_informacion` de terbio): sus datos, su
 * asesor y sus archivos. Fluor solo entrega el nombre del asesor, sin celular ni correo.
 */
@Component({
  selector: 'app-informacion',
  standalone: true,
  imports: [ArchivosComponent, PageHeaderComponent, LoadingSpinnerComponent, ErrorAlertComponent],
  templateUrl: './informacion.component.html',
  styleUrl: './informacion.component.scss',
})
export class InformacionComponent implements OnInit {
  private readonly informacionService = inject(InformacionService);
  private readonly destroyRef = inject(DestroyRef);

  readonly modeloTercero = MODELO_TERCERO;
  readonly identificacion = identificacionCliente;
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly cliente = signal<InformacionCliente | null>(null);

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.loading.set(true);
    this.error.set(null);
    this.informacionService
      .detalle()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (cliente) => {
          this.cliente.set(cliente);
          this.loading.set(false);
        },
        error: (err) => {
          this.error.set(extractErrorMessage(err, 'No se pudo cargar tu información.'));
          this.loading.set(false);
        },
      });
  }
}
