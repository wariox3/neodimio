import { Component, inject, signal, viewChild } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormsModule,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { MessageModule } from 'primeng/message';
import { CheckboxModule } from 'primeng/checkbox';
import { DialogModule } from 'primeng/dialog';
import { AuthService } from '../../services/auth.service';
import { ENVIRONMENT, extractErrorMessage, trimFormValues } from '@semantica/core';
import { TurnstileComponent } from '../../../../shared';
import { TrimInputDirective } from '@semantica/ui';

function passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
  const password = control.get('password')?.value;
  const confirmPassword = control.get('confirmPassword')?.value;
  return password && confirmPassword && password !== confirmPassword
    ? { passwordMismatch: true }
    : null;
}

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    FormsModule,
    RouterLink,
    ButtonModule,
    InputTextModule,
    PasswordModule,
    MessageModule,
    CheckboxModule,
    DialogModule,
    TurnstileComponent,
    TrimInputDirective,
  ],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss',
})
export class RegisterComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly turnstile = viewChild(TurnstileComponent);
  private readonly env = inject(ENVIRONMENT);

  readonly whatsappPhone = this.env.whatsappPhone;

  readonly isLoading = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly submitted = signal(false);
  readonly captchaToken = signal<string | null>(null);
  readonly termsAccepted = signal(false);
  readonly termsDialogVisible = signal(false);

  readonly form = this.fb.group(
    {
      nombres: ['', [Validators.required, Validators.minLength(2)]],
      apellidos: ['', [Validators.required, Validators.minLength(2)]],
      numero_identificacion: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', Validators.required],
    },
    { validators: passwordMatchValidator },
  );

  onSubmit(): void {
    trimFormValues(this.form);

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);

    const { nombres, apellidos, numero_identificacion, email, password } = this.form.getRawValue();

    this.authService
      .register({
        nombres: nombres!,
        apellidos: apellidos!,
        numero_identificacion: numero_identificacion!,
        email: email!,
        password: password!,
        turnstile_token: this.captchaToken()!,
      })
      .subscribe({
        next: () => {
          this.turnstile()?.reset();
          this.submitted.set(true);
          this.isLoading.set(false);
        },
        error: (err) => {
          this.turnstile()?.reset();
          this.captchaToken.set(null);
          this.errorMessage.set(
            extractErrorMessage(err, 'No se pudo completar el registro. Inténtalo de nuevo.'),
          );
          this.isLoading.set(false);
        },
      });
  }

  get nombresControl() {
    return this.form.controls.nombres;
  }

  get apellidosControl() {
    return this.form.controls.apellidos;
  }

  get identificacionControl() {
    return this.form.controls.numero_identificacion;
  }

  get emailControl() {
    return this.form.controls.email;
  }

  get passwordControl() {
    return this.form.controls.password;
  }

  get confirmPasswordControl() {
    return this.form.controls.confirmPassword;
  }
}
