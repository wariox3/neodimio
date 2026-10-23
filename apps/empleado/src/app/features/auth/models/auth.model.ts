import { BaseUsuario, LoginRequest, AuthResponse, ResendVerificationRequest } from '@semantica/core';

// Re-export for backward compatibility
export type { LoginRequest, AuthResponse, ResendVerificationRequest };

export interface Usuario extends BaseUsuario {
  name: string;
  apellidos: string | null;
  numero_identificacion: string | null;
  tenant_id: number | null;
  empleado_id: number | null;
  tenant_nombre: string | null;
}

export interface AsociarEmpresaRequest {
  usuario_id: number;
  tenant_id: number;
}

export interface RegisterRequest {
  email: string;
  password: string;
  nombres: string;
  apellidos: string;
  numero_identificacion: string;
  turnstile_token?: string;
}

export interface RegisteredUser {
  id: number;
  email: string;
  role: string;
  tenant_id: number;
  nombres: string;
  apellidos: string;
  numero_identificacion: string;
  is_verified: boolean;
}

export interface RegisterResponse {
  user: RegisteredUser;
  verification_link: string;
}
