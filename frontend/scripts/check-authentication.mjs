import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = process.cwd();
const source = (path) => readFileSync(resolve(root, path), 'utf8');

const storage = new Map();
globalThis.window = {
  history: {
    replaceState: () => undefined
  },
  localStorage: {
    getItem: (key) => storage.get(key) ?? null,
    setItem: (key, value) => storage.set(key, value),
    removeItem: (key) => storage.delete(key)
  }
};

const { createSessionStore } = await import('../src/features/auth/session-store.ts');
const { ApiClient } = await import('../src/shared/services/api-client.ts');

const sessionStore = createSessionStore(globalThis.window.localStorage);
assert.equal(sessionStore.getSession(), null);
sessionStore.setSession({
  accessToken: 'token-123',
  user: {
    id: 'user-1',
    name: 'Administrador',
    email: 'admin@gyrmonitor.local',
    role: 'ADMIN'
  }
});
assert.equal(sessionStore.getSession()?.accessToken, 'token-123');
sessionStore.clearSession();
assert.equal(sessionStore.getSession(), null);

let unauthorizedHandled = false;
let capturedAuthorization = '';
globalThis.fetch = async (_url, options) => {
  capturedAuthorization = options.headers.Authorization;
  return {
    ok: true,
    status: 200,
    json: async () => ({ success: true, data: { ok: true } })
  };
};

const apiClient = new ApiClient({
  baseUrl: 'http://localhost:3000/api/v1',
  getAccessToken: () => 'token-456',
  onUnauthorized: () => {
    unauthorizedHandled = true;
  }
});
await apiClient.request('/protected');
assert.equal(capturedAuthorization, 'Bearer token-456');

globalThis.fetch = async () => ({
  ok: false,
  status: 401,
  json: async () => ({ success: false, error: { code: 'UNAUTHORIZED' } })
});
await assert.rejects(() => apiClient.request('/protected'));
assert.equal(unauthorizedHandled, true);

const loginPage = source('src/features/auth/LoginPage.tsx');
assert.match(loginPage, /type="password"/);
assert.match(loginPage, /setPassword\(''\)/);
assert.match(loginPage, /No se pudo iniciar sesion/);
assert.match(loginPage, /\/dashboard/);

const protectedRoute = source('src/features/auth/ProtectedRoute.tsx');
assert.match(protectedRoute, /LoginPage/);
assert.match(protectedRoute, /Acceso denegado/);
assert.match(protectedRoute, /allowedRoles\.includes/);

const authProvider = source('src/features/auth/AuthProvider.tsx');
assert.match(authProvider, /\/login/);

console.log('Frontend authentication checks passed.');
