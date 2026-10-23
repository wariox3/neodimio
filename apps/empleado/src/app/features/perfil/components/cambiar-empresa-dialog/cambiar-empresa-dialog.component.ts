import { Component, computed, inject, model, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { AutoCompleteModule, AutoCompleteCompleteEvent } from 'primeng/autocomplete';
import { ButtonModule } from 'primeng/button';
import { MessageModule } from 'primeng/message';
import { ToastService, extractErrorMessage } from '@semantica/core';
import { AuthService } from '../../../auth/services/auth.service';
import { Tenant } from '../../../dashboard/models/tenant.model';

type Step = 'select' | 'confirm';

/**
 * Permite a un usuario ya vinculado cambiar de empresa.
 *
 * Reutiliza la busqueda de tenants y el endpoint de asociacion de `AuthService`,
 * pero con un flujo en dos pasos (seleccionar -> confirmar) porque cambiar de
 * empresa reescribe el `empleado_id` y el contexto laboral del usuario.
 */
@Component({
  selector: 'app-cambiar-empresa-dialog',
  standalone: true,
  imports: [FormsModule, DialogModule, AutoCompleteModule, ButtonModule, MessageModule],
  templateUrl: './cambiar-empresa-dialog.component.html',
  styleUrl: './cambiar-empresa-dialog.component.scss',
})
export class CambiarEmpresaDialogComponent {
  private readonly authService = inject(AuthService);
  private readonly toastService = inject(ToastService);

  readonly visible = model(false);
  readonly cambiada = output<void>();

  readonly step = signal<Step>('select');
  readonly suggestions = signal<Tenant[]>([]);
  readonly searching = signal(false);
  readonly submitting = signal(false);
  readonly errorMessage = signal<string | null>(null);

  selectedTenant: Tenant | null = null;

  /** Empresa a la que el usuario esta vinculado actualmente. */
  readonly empresaActual = computed(() => {
    const user = this.authService.currentUser();
    if (!user?.tenant_id) return null;
    return { id: user.tenant_id, nombre: user.tenant_nombre ?? `Empresa #${user.tenant_id}` };
  });

  onSearch(event: AutoCompleteCompleteEvent): void {
    const query = event.query.trim();

    if (query.length < 2) {
      this.suggestions.set([]);
      return;
    }

    this.searching.set(true);
    this.authService.buscarTenants(query).subscribe({
      next: (res) => {
        // La empresa actual se excluye: no tiene sentido "cambiar" a la misma.
        const actualId = this.empresaActual()?.id;
        this.suggestions.set(res.items.filter((t) => t.id !== actualId));
        this.searching.set(false);
      },
      error: () => {
        this.suggestions.set([]);
        this.searching.set(false);
      },
    });
  }

  onShow(): void {
    this.step.set('select');
    this.selectedTenant = null;
    this.errorMessage.set(null);
    this.suggestions.set([]);
  }

  goToConfirm(): void {
    if (!this.selectedTenant) {
      this.errorMessage.set('Debes seleccionar una empresa.');
      return;
    }

    if (this.selectedTenant.id === this.empresaActual()?.id) {
      this.errorMessage.set('Ya estás vinculado a esa empresa. Selecciona una diferente.');
      return;
    }

    this.errorMessage.set(null);
    this.step.set('confirm');
  }

  back(): void {
    this.errorMessage.set(null);
    this.step.set('select');
  }

  onConfirm(): void {
    if (!this.selectedTenant) return;

    this.submitting.set(true);
    this.errorMessage.set(null);

    this.authService.asociarEmpresa(this.selectedTenant.id).subscribe({
      next: () => {
        this.submitting.set(false);
        this.toastService.success('Empresa actualizada correctamente.');
        this.cambiada.emit();
        this.visible.set(false);
      },
      error: (err) => {
        this.submitting.set(false);
        this.errorMessage.set(
          extractErrorMessage(
            err,
            'No se pudo cambiar la empresa. Verifica la selección e intenta de nuevo.',
          ),
        );
      },
    });
  }
}
