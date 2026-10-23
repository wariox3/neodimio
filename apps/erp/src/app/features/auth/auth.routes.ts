import { Routes } from '@angular/router';
import { publicGuard } from '../../core';

export const AUTH_ROUTES: Routes = [
  {
    path: 'login',
    canActivate: [publicGuard],
    loadComponent: () => import('./login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: 'forgot-password',
    canActivate: [publicGuard],
    loadComponent: () =>
      import('./forgot-password/forgot-password.component').then((m) => m.ForgotPasswordComponent),
  },
  {
    path: 'restablecer-clave',
    canActivate: [publicGuard],
    loadComponent: () =>
      import('./reset-password/reset-password.component').then((m) => m.ResetPasswordComponent),
  },
  {
    path: 'verify-email',
    canActivate: [publicGuard],
    loadComponent: () =>
      import('./verify-email/verify-email.component').then((m) => m.VerifyEmailComponent),
  },
  {
    path: 'resend-verification',
    canActivate: [publicGuard],
    loadComponent: () =>
      import('./resend-verification/resend-verification.component').then(
        (m) => m.ResendVerificationComponent,
      ),
  },
  { path: '', redirectTo: 'login', pathMatch: 'full' },
];
