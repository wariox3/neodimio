import { Component, inject, signal, viewChild } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { MessageModule } from 'primeng/message';
import { TrimInputDirective } from '@semantica/ui';
import { AuthService } from '../services/auth.service';
import {
  ActiveTenantService,
  isSafeReturnUrl,
  extractErrorMessage,
  trimFormValues,
  ROUTE_PATHS,
} from '../../../core';
import { TurnstileComponent } from '../../../shared';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    ReactiveFormsModule,
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
  private readonly activeTenant = inject(ActiveTenantService);

  private readonly turnstile = viewChild(TurnstileComponent);
  readonly captchaToken = signal<string | null>(null);
  readonly isLoading = signal(false);
  readonly errorMessage = signal<string | null>(null);

  readonly form = this.fb.nonNullable.group({
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
        email,
        password,
        client_type: 'web',
        turnstile_token: this.captchaToken() ?? undefined,
      })
      .subscribe({
        next: () => {
          this.turnstile()?.reset();
          // Cada inicio de sesión elige empresa de nuevo (pantalla de contenedores).
          this.activeTenant.clear();
          const raw = this.route.snapshot.queryParamMap.get('returnUrl');
          const returnUrl = raw && isSafeReturnUrl(raw) ? raw : ROUTE_PATHS.contenedores.root;
          this.router.navigateByUrl(returnUrl);
        },
        error: (err) => {
          this.turnstile()?.reset();
          this.captchaToken.set(null);
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
