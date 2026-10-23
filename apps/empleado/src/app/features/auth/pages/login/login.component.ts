import { Component, inject, signal, viewChild } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { MessageModule } from 'primeng/message';
import { AuthService } from '../../services/auth.service';
import { extractErrorMessage, trimFormValues } from '@semantica/core';
import { ROUTE_PATHS } from '../../../../core/constants/route-paths.constants';
import { TurnstileComponent } from '../../../../shared';
import { TrimInputDirective } from '@semantica/ui';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    ButtonModule,
    InputTextModule,
    PasswordModule,
    MessageModule,
    TurnstileComponent,
    TrimInputDirective,
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  private readonly turnstile = viewChild(TurnstileComponent);

  readonly isLoading = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly captchaToken = signal<string | null>(null);

  readonly form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  onSubmit(): void {
    trimFormValues(this.form);

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);

    const { email, password } = this.form.getRawValue();

    this.authService
      .login({
        email: email!,
        password: password!,
        client_type: 'web',
        turnstile_token: this.captchaToken()!,
      })
      .subscribe({
        next: () => {
          this.turnstile()?.reset();
          const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');
          const safeUrl =
            returnUrl?.startsWith('/') && !returnUrl.startsWith('//') ? returnUrl : '/dashboard';
          this.router.navigateByUrl(safeUrl);
        },
        error: (err) => {
          this.turnstile()?.reset();
          this.captchaToken.set(null);

          if (err.error?.error?.is_verified === false) {
            this.router.navigate([ROUTE_PATHS.auth.resendVerification], {
              queryParams: { email: this.form.getRawValue().email, unverified: true },
            });
            return;
          }

          this.errorMessage.set(extractErrorMessage(err, 'Credenciales inválidas.'));
          this.isLoading.set(false);
        },
      });
  }

  get emailControl() {
    return this.form.controls.email;
  }
  get passwordControl() {
    return this.form.controls.password;
  }
}
