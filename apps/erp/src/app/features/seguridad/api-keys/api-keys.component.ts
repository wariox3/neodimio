import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TooltipModule } from 'primeng/tooltip';
import { MessageService, ConfirmationService } from 'primeng/api';
import { PageHeaderComponent, LoadingSpinnerComponent, EmptyStateComponent } from '../../../shared';
import { ApiKeyService } from '../services/api-key.service';
import { ApiKey } from '../models/api-key.model';
import { ActiveTenantService, extractErrorMessage } from '../../../core';

@Component({
  selector: 'app-api-keys',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    DatePipe,
    PageHeaderComponent,
    LoadingSpinnerComponent,
    EmptyStateComponent,
    ButtonModule,
    TableModule,
    DialogModule,
    InputTextModule,
    ConfirmDialogModule,
    TooltipModule,
  ],
  providers: [ConfirmationService],
  templateUrl: './api-keys.component.html',
  styleUrl: './api-keys.component.scss',
})
export class ApiKeysComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly apiKeyService = inject(ApiKeyService);
  /** Empresa activa: el dashboard no se abre sin ella (`activeTenantGuard`). */
  private readonly tenantId = inject(ActiveTenantService).tenantId;
  private readonly messageService = inject(MessageService);
  private readonly confirmationService = inject(ConfirmationService);

  readonly apiKeys = this.apiKeyService.apiKeys;

  readonly loading = signal(false);
  readonly createDialogVisible = signal(false);
  readonly revealDialogVisible = signal(false);
  readonly submitting = signal(false);
  readonly newFullKey = signal<string | null>(null);
  readonly copied = signal(false);

  readonly createForm = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]],
  });

  ngOnInit(): void {
    this.loadKeys();
  }

  loadKeys(): void {
    const tenantId = this.tenantId();
    if (tenantId === null) return;

    this.loading.set(true);
    this.apiKeyService.getApiKeys(tenantId).subscribe({
      next: () => this.loading.set(false),
      error: (err: unknown) => {
        this.loading.set(false);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: extractErrorMessage(err, 'No se pudieron cargar las API Keys.'),
        });
      },
    });
  }

  openCreateDialog(): void {
    this.createForm.reset();
    this.createDialogVisible.set(true);
  }

  submitCreate(): void {
    const tenantId = this.tenantId();
    if (this.createForm.invalid || tenantId === null) {
      this.createForm.markAllAsTouched();
      return;
    }

    this.submitting.set(true);
    const { name } = this.createForm.getRawValue();

    this.apiKeyService.createApiKey({ name: name!, tenant_id: tenantId }).subscribe({
      next: (res) => {
        this.submitting.set(false);
        this.createDialogVisible.set(false);
        this.newFullKey.set(res.api_key);
        this.revealDialogVisible.set(true);
        this.loadKeys();
      },
      error: (err) => {
        this.submitting.set(false);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: extractErrorMessage(err, 'No se pudo crear la API Key.'),
        });
      },
    });
  }

  confirmDelete(key: ApiKey): void {
    this.confirmationService.confirm({
      message: `¿Eliminar la clave <strong>${key.name}</strong>? Esta acción no se puede deshacer y las integraciones que la usen dejarán de funcionar.`,
      header: 'Eliminar API Key',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Eliminar',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => this.deleteKey(key.id),
    });
  }

  private deleteKey(id: number): void {
    this.apiKeyService.deleteApiKey(id).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Eliminada',
          detail: 'La API Key fue eliminada.',
        });
      },
    });
  }

  copyKey(value: string): void {
    navigator.clipboard.writeText(value).then(() => {
      this.copied.set(true);
      setTimeout(() => this.copied.set(false), 2000);
    });
  }

  closeRevealDialog(): void {
    this.revealDialogVisible.set(false);
    this.newFullKey.set(null);
    this.copied.set(false);
  }
}
