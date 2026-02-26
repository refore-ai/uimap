import type { ServerRegion } from './enum';

export interface ICredential {
  server: ServerRegion | string;
  apiKey: string;
  appId: string;
}

// ========== CLI Configuration ==========
export interface CredentialConfig {
  credentials?: Record<string, ICredential>;
  default?: string;
}

// ========== Authentication ==========
export type SessionCredentials = Record<string, string>;
export type SessionConfig = Record<string, SessionCredentials>;
