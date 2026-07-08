import { resolveApiBaseUrl, warnIfApiBaseUrlLooksMisconfigured } from '../../../shared/config/api-config';
import { ApiClient } from '../../../shared/services/api-client';
import type { SessionState } from '../domain';
import { browserSessionStore } from '../infrastructure';

export type AuthContextValue = {
  session: SessionState | null;
  apiClient: ApiClient;
  setSession(session: SessionState): void;
  clearSession(): void;
};

export function getStoredSession(): SessionState | null {
  return browserSessionStore.getSession();
}

export function persistSession(session: SessionState): void {
  browserSessionStore.setSession(session);
}

export function clearStoredSession(): void {
  browserSessionStore.clearSession();
}

export function createAuthenticatedApiClient(onUnauthorized: () => void): ApiClient {
  warnIfApiBaseUrlLooksMisconfigured(import.meta.env, globalThis.location?.origin);

  return new ApiClient({
    baseUrl: resolveApiBaseUrl(import.meta.env),
    getAccessToken: () => browserSessionStore.getSession()?.accessToken ?? null,
    onUnauthorized
  });
}
