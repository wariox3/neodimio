import { Component, computed, inject, model, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { AutoCompleteModule, AutoCompleteCompleteEvent } from 'primeng/autocomplete';
import { ButtonModule } from 'primeng/button';
import { MessageModule } from 'primeng/message';
import { ActiveTenantService, ToastService, extractErrorMessage } from '@semantica/core';
import { AuthService } from '../../../auth/services/auth.service';
import { Tenant } from '../../../dashboard/models/tenant.model';
import { MembresiaService } from '../../../dashboard/services/membresia.service';

type Step = 'select' | 'confirm';

/**
 * Asociar otra empresa: un usuario ya vinculado agrega una empresa más a su
 * cuenta. Las que ya tiene se conservan; luego la elige con "Cambiar empresa"
 * en el menú del usuario.
 *
 * Reutiliza la búsqueda de tenants y el endpoint de asociación de `AuthService`,
 * con un flujo en dos pasos (seleccionar -> confirmar).
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
  private readonly activeTenant = inject(ActiveTenantService).tenant;
  private readonly membresiaService = inject(MembresiaService);

  readonly visible = model(false);
  readonly cambiada = output<void>();

  readonly step = signal<Step>('select');
  readonly suggestions = signal<Tenant[]>([]);
  readonly searching = signal(false);
  readonly submitting = signal(false);
  readonly errorMessage = signal<string | null>(null);

  selectedTenant: Tenant | null = null;

  /** Empresa elegida actualmente. */
  readonly empresaActual = computed(() => {
    const tenant = this.activeTenant();
    return tenant ? { id: tenant.id, nombre: tenant.nombre } : null;
  });

  /** Empresas a las que el usuario ya pertenece: no se puede asociar de nuevo. */
  private readonly empresasAsociadas = computed(
    () => new Set((this.membresiaService.membresias() ?? []).map((m) => m.tenant_id)),
  );

  onSearch(event: AutoCompleteCompleteEvent): void {
    const query = event.query.trim();

    if (query.length < 2) {
      this.suggestions.set([]);
      return;
    }

    this.searching.set(true);
    this.authService.buscarTenants(query).subscribe({
      next: (res) => {
        // Se excluyen las empresas a las que ya pertenece: el backend las rechazaría.
        const asociadas = this.empresasAsociadas();
        this.suggestions.set(res.items.filter((t) => !asociadas.has(t.id)));
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

    if (this.empresasAsociadas().has(this.selectedTenant.id)) {
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
        this.toastService.success('Empresa asociada correctamente.');
        this.cambiada.emit();
        this.visible.set(false);
      },
      error: (err) => {
        this.submitting.set(false);
        this.errorMessage.set(
          extractErrorMessage(
            err,
            'No se pudo asociar la empresa. Verifica la selección e intenta de nuevo.',
          ),
        );
      },
    });
  }
}
