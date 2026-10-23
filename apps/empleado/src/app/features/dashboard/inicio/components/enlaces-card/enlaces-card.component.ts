import { Component, inject, OnInit, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { LoadingSpinnerComponent, EmptyStateComponent, ErrorAlertComponent } from '@semantica/ui';
import { extractErrorMessage } from '@semantica/core';
import { ButtonModule } from 'primeng/button';
import { EnlacesService } from '../../services/enlaces.service';
import { Enlace } from '../../models/enlace.model';

@Component({
  selector: 'app-enlaces-card',
  standalone: true,
  imports: [
    DatePipe,
    LoadingSpinnerComponent,
    EmptyStateComponent,
    ErrorAlertComponent,
    ButtonModule,
  ],
  templateUrl: './enlaces-card.component.html',
  styleUrl: './enlaces-card.component.scss',
})
export class EnlacesCardComponent implements OnInit {
  private readonly enlacesService = inject(EnlacesService);

  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly enlaces = signal<Enlace[]>([]);

  ngOnInit(): void {
    this.loadEnlaces();
  }

  loadEnlaces(): void {
    this.loading.set(true);
    this.error.set(null);

    this.enlacesService.getEnlaces().subscribe({
      next: (data) => {
        this.enlaces.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(extractErrorMessage(err, 'Error al cargar los enlaces'));
        this.loading.set(false);
      },
    });
  }
}
