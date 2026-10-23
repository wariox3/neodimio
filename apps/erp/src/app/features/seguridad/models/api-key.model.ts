export interface ApiKey {
  id: number;
  name: string;
  tenant_id: number;
  prefix?: string;
  created_at: string;
  expires_at: string | null;
  last_used_at: string | null;
}

export interface CreateApiKeyRequest {
  name: string;
  tenant_id: number;
}

export interface CreateApiKeyResponse {
  /** Clave completa — solo visible en la respuesta de creación */
  api_key: string;
  prefix: string;
  warning: string;
}
