import { Component, computed, inject } from '@angular/core';
import { PageHeaderComponent } from '../../../shared';
import { AuthService } from '../../auth/services/auth.service';

@Component({
  selector: 'app-inicio',
  standalone: true,
  imports: [PageHeaderComponent],
  templateUrl: './inicio.component.html',
})
export class InicioComponent {
  private readonly authService = inject(AuthService);

  readonly saludo = computed(() => {
    const user = this.authService.currentUser();
    const nombre = user?.nombres?.trim();
    return nombre ? `Bienvenido, ${nombre}` : 'Bienvenido';
  });
}
