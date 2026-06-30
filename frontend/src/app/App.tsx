import { useEffect, useState } from 'react';

import { AuthProvider, useAuth } from '../features/auth/AuthProvider';
import { ProtectedRoute } from '../features/auth/ProtectedRoute';
import { Roles } from '../features/auth/auth.types';
import { CattleDetailPage } from '../features/cattle/CattleDetailPage';
import { CattleListPage } from '../features/cattle/CattleListPage';

function AuthenticatedHome({ onOpenCattle }: { onOpenCattle(): void }) {
  const { session, clearSession } = useAuth();

  return (
    <main>
      <h1>GyrMonitor</h1>
      <p>Sesion activa: {session?.user.name}</p>
      <p>Rol: {session?.user.role}</p>
      <button onClick={onOpenCattle} type="button">
        Cattle
      </button>
      <button onClick={clearSession} type="button">
        Cerrar sesion
      </button>
    </main>
  );
}

function AppRoutes() {
  const [path, setPath] = useState(() => window.location.pathname);
  const refreshRoute = () => setPath(window.location.pathname);

  useEffect(() => {
    window.addEventListener('popstate', refreshRoute);
    return () => window.removeEventListener('popstate', refreshRoute);
  }, []);

  function navigate(nextPath: string) {
    window.history.pushState(null, '', nextPath);
    refreshRoute();
  }

  const detailMatch = path.match(/^\/cattle\/([^/]+)$/);

  return (
    <ProtectedRoute allowedRoles={[Roles.ADMIN, Roles.RESEARCHER]} onAuthenticated={refreshRoute}>
      {path === '/cattle' ? (
        <CattleListPage onOpenCattle={(id) => navigate(`/cattle/${id}`)} />
      ) : detailMatch ? (
        <CattleDetailPage cattleId={detailMatch[1]} onBackToList={() => navigate('/cattle')} />
      ) : (
        <AuthenticatedHome onOpenCattle={() => navigate('/cattle')} />
      )}
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
