import { Component, computed, DestroyRef, inject, OnInit, signal, viewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { AuthService } from '../../services/auth.service';
import { createCooldown, extractErrorMessage } from '@semantica/core';
import { TurnstileComponent } from '../../../../shared';

const COOLDOWN_SECONDS = 60;

@Component({
  selector: 'app-resend-verification',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    ButtonModule,
    InputTextModule,
    MessageModule,
    TurnstileComponent,
  ],
  templateUrl: './resend-verification.component.html',
  styleUrl: './resend-verification.component.scss',
})
export class ResendVerificationComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);
  private readonly turnstile = viewChild(TurnstileComponent);

  readonly isLoading = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly sent = signal(false);
  readonly captchaToken = signal<string | null>(null);
  readonly isUnverified = signal(false);

  private readonly cd = createCooldown();
  readonly cooldown = this.cd.remaining;

  /** Label dinámico del botón: cuenta regresiva mientras el cooldown está activo. */
  readonly cooldownLabel = computed(() => {
    const secs = this.cooldown();
    if (secs <= 0) {
      return 'Reenviar verificación';
    }
    const mins = Math.floor(secs / 60);
    const rest = (secs % 60).toString().padStart(2, '0');
    return `Reenviar en ${mins}:${rest}`;
  });

  readonly form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
  });

  ngOnInit(): void {
    const params = this.route.snapshot.queryParamMap;
    const email = params.get('email');
    if (email) {
      this.form.patchValue({ email });
      this.cd.restore(this.cooldownKey(email));
    }
    if (params.get('unverified') === 'true') {
      this.isUnverified.set(true);
    }

    // Reaparece el cooldown si se escribe un correo que aún está en espera.
    this.emailControl.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((value) => {
      if (value && this.emailControl.valid) {
        this.cd.restore(this.cooldownKey(value));
      }
    });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);

    const { email } = this.form.getRawValue();

    this.authService
      .resendVerification({ email: email!, turnstile_token: this.captchaToken()! })
      .subscribe({
        next: () => {
          this.turnstile()?.reset();
          this.captchaToken.set(null);
          this.sent.set(true);
          this.isLoading.set(false);
          this.cd.start(COOLDOWN_SECONDS, this.cooldownKey(email!));
        },
        error: (err) => {
          this.turnstile()?.reset();
          this.captchaToken.set(null);
          this.errorMessage.set(
            extractErrorMessage(err, 'No se pudo reenviar el correo. Inténtalo de nuevo.'),
          );
          this.isLoading.set(false);
        },
      });
  }

  private cooldownKey(email: string): string {
    return `resend-verification:${email.trim().toLowerCase()}`;
  }

  get emailControl() {
    return this.form.controls.email;
  }
}
