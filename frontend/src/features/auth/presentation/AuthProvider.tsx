import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';

import { clearStoredSession, createAuthenticatedApiClient, getStoredSession, persistSession, type AuthContextValue } from '../application/auth-session';
import type { SessionState } from '../domain';

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const [session, setSessionState] = useState<SessionState | null>(() => getStoredSession());

  const value = useMemo<AuthContextValue>(() => {
    const clearSession = () => {
      clearStoredSession();
      setSessionState(null);
      navigate('/login', { replace: true });
    };

    return {
      session,
      apiClient: createAuthenticatedApiClient(clearSession),
      setSession(nextSession) {
        persistSession(nextSession);
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
