import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';

import { ApiClient } from '../../shared/services/api-client';
import { browserSessionStore } from './session-store';
import type { SessionState } from './auth.types';

type AuthContextValue = {
  session: SessionState | null;
  apiClient: ApiClient;
  setSession(session: SessionState): void;
  clearSession(): void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSessionState] = useState<SessionState | null>(() => browserSessionStore.getSession());

  const value = useMemo<AuthContextValue>(() => {
    const clearSession = () => {
      browserSessionStore.clearSession();
      setSessionState(null);
      window.history.replaceState(null, '', '/login');
    };

    return {
      session,
      apiClient: new ApiClient({
        baseUrl: import.meta.env.VITE_API_BASE_URL ?? 'http://127.0.0.1:3000/api/v1',
        getAccessToken: () => browserSessionStore.getSession()?.accessToken ?? null,
        onUnauthorized: clearSession
      }),
      setSession(nextSession) {
        browserSessionStore.setSession(nextSession);
        setSessionState(nextSession);
      },
      clearSession
    };
  }, [session]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider.');
  }

  return context;
}
