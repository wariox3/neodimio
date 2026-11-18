import { Component, inject, signal, viewChild } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ROUTE_PATHS } from '../../../core';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { AuthService } from '../services/auth.service';
import { extractErrorMessage } from '@semantica/core';
import { TurnstileComponent } from '../../../shared';

/**
 * Solicitud de recuperación de contraseña: fluor envía al correo el enlace a
 * `/auth/restablecer-clave`. Si la cuenta no está verificada, se ofrece reenviar la verificación.
 */
@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    ButtonModule,
    InputTextModule,
    MessageModule,
    TurnstileComponent,
  ],
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.scss',
})
export class ForgotPasswordComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly turnstile = viewChild(TurnstileComponent);

  readonly isLoading = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly submitted = signal(false);
  readonly captchaToken = signal<string | null>(null);

  readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
  });

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);

    const { email } = this.form.getRawValue();

    this.authService.forgotPassword(email, this.captchaToken() ?? undefined).subscribe({
      next: () => {
        this.turnstile()?.reset();
        this.submitted.set(true);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.turnstile()?.reset();
        this.captchaToken.set(null);

        if (err.error?.error?.is_verified === false) {
          this.router.navigate([ROUTE_PATHS.auth.resendVerification], {
            queryParams: { email, unverified: true },
          });
          return;
        }

        this.errorMessage.set(extractErrorMessage(err, 'Ocurrió un error. Intenta de nuevo.'));
        this.isLoading.set(false);
      },
    });
  }

  get emailControl() {
    return this.form.controls.email;
  }
}
