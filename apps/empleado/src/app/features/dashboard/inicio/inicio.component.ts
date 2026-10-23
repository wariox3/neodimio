import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../auth/services/auth.service';
import { PageHeaderComponent } from '@semantica/ui';
import { ROUTE_PATHS } from '../../../core/constants/route-paths.constants';
import { EnlacesCardComponent } from './components/enlaces-card/enlaces-card.component';

interface QuickAccessItem {
  label: string;
  description: string;
  icon: string;
  route: string;
  requiresTenant: boolean;
  disabled?: boolean;
  disabledLabel?: string;
}

interface QuickAccessSection {
  label: string;
  icon: string;
  items: QuickAccessItem[];
}

@Component({
  selector: 'app-inicio',
  standalone: true,
  imports: [RouterLink, PageHeaderComponent, EnlacesCardComponent],
  templateUrl: './inicio.component.html',
  styleUrl: './inicio.component.scss',
})
export class InicioComponent {
  private readonly authService = inject(AuthService);

  readonly currentUser = this.authService.currentUser;
  readonly hasTenant = this.authService.hasTenant;

  readonly sections: QuickAccessSection[] = [
    {
      label: 'Consultas',
      icon: 'pi pi-search',
      items: [
        {
          label: 'Pagos',
          description: 'Consulta tus comprobantes de pago y nómina detallada.',
          icon: 'pi pi-credit-card',
          route: ROUTE_PATHS.dashboard.pagos,
          requiresTenant: true,
        },
        {
          label: 'Turnos',
          description: 'Revisa tu programación de turnos y horarios asignados.',
          icon: 'pi pi-calendar',
          route: ROUTE_PATHS.dashboard.turnos,
          requiresTenant: true,
        },
        {
          label: 'Reclamos',
          description: 'Gestiona tus reclamos y haz seguimiento a su estado.',
          icon: 'pi pi-exclamation-triangle',
          route: ROUTE_PATHS.dashboard.reclamos,
          requiresTenant: true,
        },
        {
          label: 'Solicitudes',
          description: 'Crea y consulta solicitudes de vacaciones, permisos y más.',
          icon: 'pi pi-file',
          route: ROUTE_PATHS.dashboard.solicitudes,
          requiresTenant: true,
        },
        {
          label: 'Capacitaciones',
          description: 'Accede a capacitaciones y cursos en línea disponibles.',
          icon: 'pi pi-book',
          route: ROUTE_PATHS.dashboard.capacitaciones,
          requiresTenant: true,
        },
        {
          label: 'Certificado laboral',
          description: 'Descarga tu certificado laboral actualizado.',
          icon: 'pi pi-id-card',
          route: ROUTE_PATHS.dashboard.certificadoLaboral,
          requiresTenant: true,
        },
      ],
    },
    {
      label: 'Finanzas',
      icon: 'pi pi-wallet',
      items: [
        {
          label: 'Créditos',
          description: 'Solicita y consulta tus créditos disponibles.',
          icon: 'pi pi-money-bill',
          route: ROUTE_PATHS.dashboard.creditos,
          requiresTenant: true,
          disabled: true,
          disabledLabel: 'Próximamente',
        },
        {
          label: 'Anticipo de nómina',
          description: 'Gestiona y solicita anticipos sobre tu nómina.',
          icon: 'pi pi-dollar',
          route: ROUTE_PATHS.dashboard.anticipoNomina,
          requiresTenant: true,
        },
      ],
    },
  ];
}
