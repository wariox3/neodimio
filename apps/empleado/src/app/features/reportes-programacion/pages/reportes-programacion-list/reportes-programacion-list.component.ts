import { Component, computed, inject } from '@angular/core';
import { AuthService } from '../../../auth/services/auth.service';
import { PageHeaderComponent } from '@semantica/ui';
import { ReportesTableComponent } from '../../components/reportes-table/reportes-table.component';

@Component({
  selector: 'app-reportes-programacion-list',
  standalone: true,
  imports: [PageHeaderComponent, ReportesTableComponent],
  templateUrl: './reportes-programacion-list.component.html',
  styleUrl: './reportes-programacion-list.component.scss',
})
export class ReportesProgramacionListComponent {
  private readonly authService = inject(AuthService);

  readonly empleadoId = computed(() => this.authService.currentUser()?.empleado_id ?? 0);
}
