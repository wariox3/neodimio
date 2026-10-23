import { BaseUsuario, LoginRequest, AuthResponse, ResendVerificationRequest } from '@semantica/core';

// Re-export for backward compatibility
export type { LoginRequest, AuthResponse, ResendVerificationRequest };

export interface Usuario extends BaseUsuario {
  tenant_id: number | null;
  tenant_nombre: string | null;
}
