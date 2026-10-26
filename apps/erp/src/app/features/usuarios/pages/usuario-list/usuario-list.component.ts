import { HttpErrorResponse } from '@angular/common/http';
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
import { SelectModule } from 'primeng/select';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService, MessageService } from 'primeng/api';
import { PageHeaderComponent } from '../../../../shared';
import { UsuarioService } from '../../services/usuario.service';
import { CODIGO_USUARIO_MAX_LENGTH, UsuarioTenantItem } from '../../models/usuario.model';
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
    SelectModule,
    ConfirmDialogModule,
  ],
  providers: [ConfirmationService],
  templateUrl: './usuario-list.component.html',
  styleUrl: './usuario-list.component.scss',
})
export class UsuarioListComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly usuarioService = inject(UsuarioService);
  private readonly messageService = inject(MessageService);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly destroyRef = inject(DestroyRef);
  /** Empresa activa del usuario conectado; la lista muestra sus usuarios. */
  private readonly tenantId = inject(ActiveTenantService).tenantId;

  readonly usuarios = this.usuarioService.usuarios;
  readonly totalRecords = this.usuarioService.total;
  readonly loading = signal(true);
  readonly rows = signal(10);

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

  // ── Diálogo de edición ──
  readonly codigoMaxLength = CODIGO_USUARIO_MAX_LENGTH;
  /** Usuario que se está editando; `null` cierra el diálogo. */
  readonly editingUsuario = signal<UsuarioTenantItem | null>(null);
  readonly savingEdit = signal(false);

  // ── Eliminación ──
  /** Membresía que se está borrando; deshabilita su botón mientras tanto. */
  readonly deletingId = signal<number | null>(null);

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

  /** Los propietarios (`control`) no se pueden retirar desde aquí. */
  canDelete(u: UsuarioTenantItem): boolean {
    return !u.control;
  }

  confirmDelete(usuario: UsuarioTenantItem): void {
    // Texto plano: nombre y correo los define el propio usuario.
    this.confirmationService.confirm({
      header: 'Retirar usuario',
      message: `¿Retirar a ${this.displayName(usuario)} de la empresa? Perderá el acceso y para volver necesitará una nueva invitación.`,
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Retirar',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-danger',
      rejectButtonStyleClass: 'p-button-text p-button-secondary',
      accept: () => this.deleteUsuario(usuario),
    });
  }

  private deleteUsuario(usuario: UsuarioTenantItem): void {
    this.deletingId.set(usuario.id);
    this.usuarioService.deleteUsuarioTenant(usuario.id).subscribe({
      next: () => {
        this.deletingId.set(null);
        this.messageService.add({
          severity: 'success',
          summary: 'Usuario retirado',
          detail: `${this.displayName(usuario)} ya no tiene acceso a la empresa.`,
        });
        // Si era la última fila de la página, retrocede una para no mostrar una página vacía.
        const page = Math.floor(this.first() / this.rows()) + 1;
        const targetPage = this.usuarios().length === 1 && page > 1 ? page - 1 : page;
        this.first.set((targetPage - 1) * this.rows());
        this.loadUsuarios(targetPage, this.rows());
      },
      error: (err: unknown) => {
        this.deletingId.set(null);
        // 0, 403, 429 y 500+ ya los avisa el interceptor.
        if (err instanceof HttpErrorResponse && [400, 404, 422].includes(err.status)) {
          this.messageService.add({
            severity: 'error',
            summary: 'No se pudo retirar',
            detail: extractErrorMessage(err, 'Intenta de nuevo en un momento.'),
          });
        }
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
