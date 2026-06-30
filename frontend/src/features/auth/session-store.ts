import type { SessionState } from './auth.types';

const storageKey = 'gyrmonitor.auth.session';

export type SessionStore = {
  getSession(): SessionState | null;
  setSession(session: SessionState): void;
  clearSession(): void;
};

export function createSessionStore(storage: Storage = window.localStorage): SessionStore {
  return {
    getSession() {
      const raw = storage.getItem(storageKey);

      if (!raw) {
        return null;
      }

      try {
        return JSON.parse(raw) as SessionState;
      } catch {
        storage.removeItem(storageKey);
        return null;
      }
    },
    setSession(session) {
      storage.setItem(storageKey, JSON.stringify(session));
    },
    clearSession() {
      storage.removeItem(storageKey);
    }
  };
}

export const browserSessionStore = createSessionStore();
