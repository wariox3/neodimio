import { Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Subject, debounceTime, distinctUntilChanged, map } from 'rxjs';
import { ButtonModule } from 'primeng/button';
import { TableModule, TableLazyLoadEvent } from 'primeng/table';
import { TooltipModule } from 'primeng/tooltip';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { PasswordModule } from 'primeng/password';
import { SelectModule } from 'primeng/select';
import { AutoCompleteModule, AutoCompleteCompleteEvent } from 'primeng/autocomplete';
import { MessageService } from 'primeng/api';
import { PageHeaderComponent } from '../../../../shared';
import { UsuarioService } from '../../services/usuario.service';
import { TenantService } from '../../services/tenant.service';
import {
  CODIGO_USUARIO_MAX_LENGTH,
  UsuarioTenantItem,
  USER_ROLES,
} from '../../models/usuario.model';
import { Tenant } from '../../models/tenant.model';
import { ActiveTenantService, extractErrorMessage } from '../../../../core';

@Component({
  selector: 'app-usuario-list',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    PageHeaderComponent,
    FormsModule,
    ButtonModule,
    TableModule,
    TooltipModule,
    DialogModule,
    InputTextModule,
    IconFieldModule,
    InputIconModule,
    PasswordModule,
    SelectModule,
    AutoCompleteModule,
  ],
  templateUrl: './usuario-list.component.html',
  styleUrl: './usuario-list.component.scss',
})
export class UsuarioListComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly usuarioService = inject(UsuarioService);
  private readonly tenantService = inject(TenantService);
  private readonly messageService = inject(MessageService);
  private readonly destroyRef = inject(DestroyRef);
  /** Empresa activa del usuario conectado; la lista muestra sus usuarios. */
  private readonly tenantId = inject(ActiveTenantService).tenantId;

  readonly usuarios = this.usuarioService.usuarios;
  readonly totalRecords = this.usuarioService.total;
  readonly loading = signal(true);
  readonly rows = signal(10);

  readonly roleOptions = USER_ROLES;

  // ── Filtros ──
  /** Acceso al ERP; `null` muestra todos. Por defecto solo los usuarios con acceso. */
  readonly erpFilter = signal<boolean | null>(true);
  /** Propietario de la empresa; `null` muestra todos. */
  readonly controlFilter = signal<boolean | null>(null);
  readonly searchEmail = signal('');
  readonly searchCodigo = signal('');
  /** Índice de la primera fila; permite resetear el paginador a la página 1. */
  readonly first = signal(0);

  readonly erpFilterOptions = [
    { label: 'Todos', value: null },
    { label: 'Con acceso al ERP', value: true },
    { label: 'Sin acceso al ERP', value: false },
  ];

  readonly controlFilterOptions = [
    { label: 'Control: sí', value: true },
    { label: 'Control: no', value: false },
  ];

  /** Términos de búsqueda normalizados; evita recargar si solo cambian espacios. */
  private readonly searchTerms = computed(() =>
    JSON.stringify([this.searchEmail().trim(), this.searchCodigo().trim()]),
  );
  private readonly searchChange = new Subject<void>();

  // ── Diálogo de creación ──
  readonly createDialogVisible = signal(false);
  readonly submitting = signal(false);
  readonly tenantSuggestions = signal<Tenant[]>([]);
  readonly searchingTenants = signal(false);

  readonly createForm = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    role: ['', Validators.required],
    tenant: [null as Tenant | null, Validators.required],
  });

  // ── Diálogo de edición ──
  readonly codigoMaxLength = CODIGO_USUARIO_MAX_LENGTH;
  /** Usuario que se está editando; `null` cierra el diálogo. */
  readonly editingUsuario = signal<UsuarioTenantItem | null>(null);
  readonly savingEdit = signal(false);

  readonly editForm = this.fb.nonNullable.group({
    codigoUsuario: ['', Validators.maxLength(CODIGO_USUARIO_MAX_LENGTH)],
  });

  constructor() {
    // Las búsquedas de texto se debouncean para no disparar una petición por tecla.
    this.searchChange
      .pipe(
        debounceTime(300),
        map(() => this.searchTerms()),
        distinctUntilChanged(),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(() => this.resetAndLoad());
  }

  ngOnInit(): void {
    this.loadUsuarios(1, this.rows());
  }

  onLazyLoad(event: TableLazyLoadEvent): void {
    const first = event.first ?? 0;
    const rows = event.rows ?? this.rows();
    this.first.set(first);
    this.rows.set(rows);
    const page = Math.floor(first / rows) + 1;
    this.loadUsuarios(page, rows);
  }

  onEmailInput(value: string): void {
    this.searchEmail.set(value);
    this.searchChange.next();
  }

  onCodigoInput(value: string): void {
    this.searchCodigo.set(value);
    this.searchChange.next();
  }

  onErpChange(erp: boolean | null): void {
    this.erpFilter.set(erp);
    this.resetAndLoad();
  }

  onControlChange(control: boolean | null): void {
    this.controlFilter.set(control);
    this.resetAndLoad();
  }

  /** Vuelve a la primera página y recarga con los filtros actuales. */
  private resetAndLoad(): void {
    this.first.set(0);
    this.loadUsuarios(1, this.rows());
  }

  loadUsuarios(page: number, size: number): void {
    const tenantId = this.tenantId();
    if (tenantId === null) {
      this.loading.set(false);
      return;
    }

    this.loading.set(true);
    this.usuarioService
      .getUsuarios(tenantId, page, size, {
        erp: this.erpFilter(),
        control: this.controlFilter(),
        email: this.searchEmail().trim() || null,
        codigoUsuario: this.searchCodigo().trim() || null,
      })
      .subscribe({
        next: () => this.loading.set(false),
        error: (err: unknown) => {
          this.loading.set(false);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: extractErrorMessage(err, 'No se pudieron cargar los usuarios.'),
          });
        },
      });
  }

  openCreateDialog(): void {
    this.createForm.reset({ email: '', password: '', role: '', tenant: null });
    this.tenantSuggestions.set([]);
    this.createDialogVisible.set(true);
  }

  onSearchTenants(event: AutoCompleteCompleteEvent): void {
    const query = event.query.trim();
    if (query.length < 2) {
      this.tenantSuggestions.set([]);
      return;
    }

    this.searchingTenants.set(true);
    this.tenantService.buscarTenants(query).subscribe({
      next: (tenants) => {
        this.tenantSuggestions.set(tenants);
        this.searchingTenants.set(false);
      },
      error: () => {
        this.tenantSuggestions.set([]);
        this.searchingTenants.set(false);
      },
    });
  }

  submitCreate(): void {
    if (this.createForm.invalid) {
      this.createForm.markAllAsTouched();
      return;
    }

    const { email, password, role, tenant } = this.createForm.getRawValue();
    if (tenant == null) return;

    this.submitting.set(true);
    this.usuarioService.createUsuario({ email, password, role, tenant_id: tenant.id }).subscribe({
      next: () => {
        this.submitting.set(false);
        this.createDialogVisible.set(false);
        this.messageService.add({
          severity: 'success',
          summary: 'Usuario creado',
          detail: `Se creó el usuario ${email}.`,
        });
        this.first.set(0);
        this.loadUsuarios(1, this.rows());
      },
      error: (err: unknown) => {
        this.submitting.set(false);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: extractErrorMessage(err, 'No se pudo crear el usuario.'),
        });
      },
    });
  }

  openEditDialog(usuario: UsuarioTenantItem): void {
    this.editForm.reset({ codigoUsuario: usuario.codigo_usuario_fk ?? '' });
    this.editingUsuario.set(usuario);
  }

  closeEditDialog(): void {
    this.editingUsuario.set(null);
  }

  submitEdit(): void {
    const usuario = this.editingUsuario();
    if (!usuario) return;
    if (this.editForm.invalid) {
      this.editForm.markAllAsTouched();
      return;
    }

    // Vacío se envía como null: el backend lo interpreta como quitar el código.
    const codigo = this.editForm.getRawValue().codigoUsuario.trim() || null;

    this.savingEdit.set(true);
    this.usuarioService.updateUsuarioTenant(usuario.id, { codigo_usuario_fk: codigo }).subscribe({
      next: () => {
        this.savingEdit.set(false);
        this.closeEditDialog();
        this.messageService.add({
          severity: 'success',
          summary: 'Usuario actualizado',
          detail: `Se actualizó el usuario semantica de ${this.displayName(usuario)}.`,
        });
        // Recarga la página actual: con filtros activos la fila puede dejar de coincidir.
        this.loadUsuarios(Math.floor(this.first() / this.rows()) + 1, this.rows());
      },
      error: (err: unknown) => {
        this.savingEdit.set(false);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: extractErrorMessage(err, 'No se pudo actualizar el usuario.'),
        });
      },
    });
  }

  /** Nombre completo del usuario; cae al email si no tiene nombre cargado. */
  displayName(u: UsuarioTenantItem): string {
    const full = `${u.nombres ?? ''} ${u.apellidos ?? ''}`.trim();
    return full || u.email;
  }

  /** Indica si el usuario tiene nombre cargado (para mostrar el email como secundario). */
  hasName(u: UsuarioTenantItem): boolean {
    return Boolean(u.nombres?.trim() || u.apellidos?.trim());
  }

  /** Inicial para el avatar de la fila. */
  initial(u: UsuarioTenantItem): string {
    return this.displayName(u).charAt(0).toUpperCase() || '?';
  }
}
