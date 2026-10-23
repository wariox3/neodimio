import { Component, OnInit, inject, signal } from '@angular/core';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { ROUTE_PATHS, extractErrorMessage } from '../../../core';

@Component({
  selector: 'app-verify-email',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './verify-email.component.html',
  styleUrl: './verify-email.component.scss',
})
export class VerifyEmailComponent implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly isLoading = signal(true);
  readonly errorMessage = signal<string | null>(null);
  readonly verified = signal(false);

  ngOnInit(): void {
    const token = this.route.snapshot.queryParamMap.get('token');
    if (!token) {
      this.router.navigate([ROUTE_PATHS.auth.login]);
      return;
    }

    this.authService.verifyEmail(token).subscribe({
      next: () => {
        this.verified.set(true);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.errorMessage.set(
          extractErrorMessage(
            err,
            'No se pudo verificar la cuenta. El enlace puede haber expirado o ser inválido.',
          ),
        );
        this.isLoading.set(false);
      },
    });
  }
}
