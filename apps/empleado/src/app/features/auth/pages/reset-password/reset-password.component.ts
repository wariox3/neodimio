import { Component, OnInit, inject, signal, viewChild } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { PasswordModule } from 'primeng/password';
import { MessageModule } from 'primeng/message';
import { AuthService } from '../../services/auth.service';
import { ROUTE_PATHS } from '../../../../core/constants/route-paths.constants';
import { extractErrorMessage } from '@semantica/core';
import { TurnstileComponent } from '../../../../shared';

function passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
  const password = control.get('password')?.value;
  const confirmPassword = control.get('confirmPassword')?.value;
  return password && confirmPassword && password !== confirmPassword
    ? { passwordMismatch: true }
    : null;
}

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    ButtonModule,
    PasswordModule,
    MessageModule,
    TurnstileComponent,
  ],
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.scss',
})
export class ResetPasswordComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  private readonly turnstile = viewChild(TurnstileComponent);

  readonly isLoading = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly submitted = signal(false);
  readonly captchaToken = signal<string | null>(null);

  private token = '';

  readonly form = this.fb.group(
    {
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', Validators.required],
    },
    { validators: passwordMatchValidator },
  );

  ngOnInit(): void {
    const token = this.route.snapshot.queryParamMap.get('token');
    if (!token) {
      this.router.navigate([ROUTE_PATHS.auth.forgotPassword]);
      return;
    }
    this.token = token;
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);

    const { password } = this.form.getRawValue();

    this.authService.resetPassword(this.token, password!, this.captchaToken()!).subscribe({
      next: () => {
        this.turnstile()?.reset();
        this.submitted.set(true);
        this.isLoading.set(false);
        setTimeout(() => {
          this.router.navigate([ROUTE_PATHS.auth.login]);
        }, 2000);
      },
      error: (err) => {
        this.turnstile()?.reset();
        this.captchaToken.set(null);
        this.errorMessage.set(
          extractErrorMessage(
            err,
            'No se pudo restablecer la contraseña. El enlace puede haber expirado.',
          ),
        );
        this.isLoading.set(false);
      },
    });
  }

  get passwordControl() {
    return this.form.controls.password;
  }

  get confirmPasswordControl() {
    return this.form.controls.confirmPassword;
  }
}
