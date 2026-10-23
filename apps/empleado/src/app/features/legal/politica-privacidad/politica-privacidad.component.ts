import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ENVIRONMENT } from '@semantica/core';

@Component({
  selector: 'app-politica-privacidad',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './politica-privacidad.component.html',
  styleUrl: './politica-privacidad.component.scss',
})
export class PoliticaPrivacidadComponent {
  private readonly env = inject(ENVIRONMENT);

  readonly currentYear = new Date().getFullYear();
  readonly whatsappPhone = this.env.whatsappPhone;
  readonly whatsappUrl = `https://wa.me/57${this.env.whatsappPhone}`;
}
