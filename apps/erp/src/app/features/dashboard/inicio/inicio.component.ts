import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PageHeaderComponent } from '@semantica/ui';
import { ROUTE_PATHS } from '../../../core/constants/route-paths.constants';

interface QuickAccessItem {
  label: string;
  description: string;
  icon: string;
  route: string;
}

interface QuickAccessSection {
  label: string;
  icon: string;
  items: QuickAccessItem[];
}

@Component({
  selector: 'app-inicio',
  standalone: true,
  imports: [RouterLink, PageHeaderComponent],
  templateUrl: './inicio.component.html',
  styleUrl: './inicio.component.scss',
})
export class InicioComponent {
  readonly sections: QuickAccessSection[] = [
    {
      label: 'Seguridad',
      icon: 'pi pi-shield',
      items: [
        {
          label: 'API Keys',
          description: 'Gestiona las API keys para la autenticación de servicios.',
          icon: 'pi pi-key',
          route: ROUTE_PATHS.dashboard.apiKeys,
        },
      ],
    },
    {
      label: 'Configuración',
      icon: 'pi pi-cog',
      items: [
        {
          label: 'Formatos',
          description: 'Administra las plantillas y formatos del sistema.',
          icon: 'pi pi-file',
          route: ROUTE_PATHS.dashboard.formatos,
        },
      ],
    },
  ];
}
