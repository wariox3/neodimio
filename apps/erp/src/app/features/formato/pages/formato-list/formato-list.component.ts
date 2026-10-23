import { Component, inject, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { TableModule, TableLazyLoadEvent } from 'primeng/table';
import { TooltipModule } from 'primeng/tooltip';
import { MessageService } from 'primeng/api';
import {
  PageHeaderComponent,
  LoadingSpinnerComponent,
  EmptyStateComponent,
} from '../../../../shared';
import { FormatoService } from '../../services/formato.service';
import { extractErrorMessage } from '../../../../core';

@Component({
  selector: 'app-formato-list',
  standalone: true,
  imports: [
    PageHeaderComponent,
    LoadingSpinnerComponent,
    EmptyStateComponent,
    ButtonModule,
    TableModule,
    TooltipModule,
  ],
  templateUrl: './formato-list.component.html',
  styleUrl: './formato-list.component.scss',
})
export class FormatoListComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly formatoService = inject(FormatoService);
  private readonly messageService = inject(MessageService);

  readonly formatos = this.formatoService.formatos;
  readonly totalRecords = this.formatoService.total;
  readonly loading = signal(true);
  readonly rows = signal(50);

  ngOnInit(): void {
    this.loadFormatos(1, this.rows());
  }

  onLazyLoad(event: TableLazyLoadEvent): void {
    const first = event.first ?? 0;
    const rows = event.rows ?? this.rows();
    const page = Math.floor(first / rows) + 1;
    this.loadFormatos(page, rows);
  }

  editFormato(id: number): void {
    this.router.navigate(['/dashboard/formato/editar', id]);
  }

  private loadFormatos(page: number, size: number): void {
    this.loading.set(true);
    this.formatoService.getFormatos(page, size).subscribe({
      next: () => this.loading.set(false),
      error: (err: unknown) => {
        this.loading.set(false);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: extractErrorMessage(err, 'No se pudieron cargar los formatos.'),
        });
      },
    });
  }
}
