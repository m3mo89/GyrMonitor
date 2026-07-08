import type { ReactNode } from 'react';

import type { Role } from '../domain';
import { useAuth } from './AuthProvider';
import { LoginPage } from './LoginPage';

export function ProtectedRoute({
  allowedRoles,
  children,
  onAuthenticated = () => undefined
}: {
  allowedRoles?: Role[];
  children: ReactNode;
  onAuthenticated?: () => void;
}) {
  const { session } = useAuth();

  if (!session) {
    return <LoginPage onAuthenticated={onAuthenticated} />;
  }

  if (allowedRoles && !allowedRoles.includes(session.user.role)) {
    return (
      <main>
        <h1>Acceso denegado</h1>
        <p>No tienes permisos para consultar esta seccion.</p>
      </main>
    );
  }

  return <>{children}</>;
}
