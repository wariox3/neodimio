import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ENVIRONMENT } from '@semantica/core';

@Component({
  selector: 'app-terminos-uso',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './terminos-uso.component.html',
  styleUrl: './terminos-uso.component.scss',
})
export class TerminosUsoComponent {
  private readonly env = inject(ENVIRONMENT);

  readonly currentYear = new Date().getFullYear();
  readonly whatsappPhone = this.env.whatsappPhone;
  readonly whatsappUrl = `https://wa.me/57${this.env.whatsappPhone}`;
}
