import { useEffect, useState } from 'react';

import { AppShell } from './layouts/AppShell';
import { AppQueryProvider } from './providers/QueryProvider';
import { AuthProvider, useAuth } from '../features/auth/AuthProvider';
import { ProtectedRoute } from '../features/auth/ProtectedRoute';
import { SystemGeneratorMessage } from '../features/auth/SystemGeneratorMessage';
import { Roles } from '../features/auth/auth.types';
import { AlertDetailPage } from '../features/alerts/AlertDetailPage';
import { AlertsListPage } from '../features/alerts/AlertsListPage';
import { DashboardPage } from '../features/dashboard/DashboardPage';
import { CattleDetailPage } from '../features/cattle/CattleDetailPage';
import { CattleListPage } from '../features/cattle/CattleListPage';
import { UiState } from '../shared/components/UiState';

function AppRoutes() {
  const { session } = useAuth();
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
  const alertMatch = path.match(/^\/alerts\/([^/]+)$/);

  return (
    <ProtectedRoute allowedRoles={[Roles.ADMIN, Roles.RESEARCHER, Roles.FIELD_OPERATOR, Roles.SYSTEM_GENERATOR]} onAuthenticated={refreshRoute}>
      <AppShell currentPath={path} onNavigate={navigate}>
        {session?.user.role === Roles.SYSTEM_GENERATOR ? (
          <SystemGeneratorMessage />
        ) : (path === '/dashboard' || path === '/' || path === '/login') && hasAnyRole(session?.user.role, [Roles.ADMIN, Roles.RESEARCHER]) ? (
          <DashboardPage />
        ) : path === '/cattle' && hasAnyRole(session?.user.role, [Roles.ADMIN, Roles.RESEARCHER]) ? (
          <CattleListPage onOpenCattle={(id) => navigate(`/cattle/${id}`)} />
        ) : detailMatch && hasAnyRole(session?.user.role, [Roles.ADMIN, Roles.RESEARCHER]) ? (
          <CattleDetailPage cattleId={detailMatch[1]} onBackToList={() => navigate('/cattle')} />
        ) : path === '/alerts' ? (
          <AlertsListPage onOpenAlert={(id) => navigate(`/alerts/${id}`)} />
        ) : alertMatch ? (
          <AlertDetailPage alertId={alertMatch[1]} onBackToList={() => navigate('/alerts')} onOpenCattle={(id) => navigate(`/cattle/${id}`)} />
        ) : path === '/dashboard' || path === '/' || path === '/cattle' || detailMatch ? (
          <UiState title="Acceso denegado" description="No tienes permisos para consultar esta seccion." tone="danger" />
        ) : (
          <UiState
            title="Pagina no encontrada"
            description="No encontramos la ruta solicitada dentro del MVP web."
            action={
              <button className="button button--primary" onClick={() => navigate('/dashboard')} type="button">
                Ir al dashboard
              </button>
            }
          />
        )}
      </AppShell>
    </ProtectedRoute>
  );
}

function hasAnyRole(role: string | undefined, roles: string[]): boolean {
  return Boolean(role && roles.includes(role));
}

export function App() {
  return (
    <AuthProvider>
      <AppQueryProvider>
        <AppRoutes />
      </AppQueryProvider>
    </AuthProvider>
  );
}
