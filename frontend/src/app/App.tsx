import { useState } from 'react';

import { AuthProvider, useAuth } from '../features/auth/AuthProvider';
import { ProtectedRoute } from '../features/auth/ProtectedRoute';
import { Roles } from '../features/auth/auth.types';

function AuthenticatedHome() {
  const { session, clearSession } = useAuth();

  return (
    <main>
      <h1>GyrMonitor</h1>
      <p>Sesion activa: {session?.user.name}</p>
      <p>Rol: {session?.user.role}</p>
      <button onClick={clearSession} type="button">
        Cerrar sesion
      </button>
    </main>
  );
}

function AppRoutes() {
  const [, setNavigationVersion] = useState(0);
  const refreshRoute = () => setNavigationVersion((value) => value + 1);

  return (
    <ProtectedRoute allowedRoles={[Roles.ADMIN, Roles.RESEARCHER]} onAuthenticated={refreshRoute}>
      <AuthenticatedHome />
    </ProtectedRoute>
  );
}

export function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}
