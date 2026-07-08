import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';

import { ApiClient } from '../../shared/services/api-client';
import { resolveApiBaseUrl, warnIfApiBaseUrlLooksMisconfigured } from '../../shared/config/api-config';
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
  const navigate = useNavigate();
  const [session, setSessionState] = useState<SessionState | null>(() => browserSessionStore.getSession());

  const value = useMemo<AuthContextValue>(() => {
    warnIfApiBaseUrlLooksMisconfigured(import.meta.env, globalThis.location?.origin);

    const clearSession = () => {
      browserSessionStore.clearSession();
      setSessionState(null);
      navigate('/login', { replace: true });
    };

    return {
      session,
      apiClient: new ApiClient({
        baseUrl: resolveApiBaseUrl(import.meta.env),
        getAccessToken: () => browserSessionStore.getSession()?.accessToken ?? null,
        onUnauthorized: clearSession
      }),
      setSession(nextSession) {
        browserSessionStore.setSession(nextSession);
        setSessionState(nextSession);
      },
      clearSession
    };
  }, [navigate, session]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider.');
  }

  return context;
}
