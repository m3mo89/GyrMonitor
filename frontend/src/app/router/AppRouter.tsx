import { Navigate, Outlet, Route, Routes, useLocation, useNavigate, useParams } from 'react-router-dom';

import { AppShell } from '../layouts/AppShell';
import { AlertDetailPage, AlertsListPage } from '../../features/alerts';
import { ProtectedRoute, Roles, SystemGeneratorMessage, useAuth } from '../../features/auth';
import { CattleDetailPage, CattleListPage } from '../../features/cattle';
import { DashboardPage } from '../../features/dashboard';
import { UserListPage } from '../../features/user-management';
import { UiState } from '../../shared/components/UiState';

const OPERATIONAL_ROLES = [Roles.ADMIN, Roles.RESEARCHER, Roles.FIELD_OPERATOR, Roles.SYSTEM_GENERATOR];
const ANALYTICS_ROLES = [Roles.ADMIN, Roles.RESEARCHER];
const ADMIN_ROLES = [Roles.ADMIN];

function AuthenticatedLayout() {
  const { session } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <ProtectedRoute allowedRoles={OPERATIONAL_ROLES}>
      <AppShell currentPath={location.pathname} onNavigate={(path) => navigate(path)}>
        {session?.user.role === Roles.SYSTEM_GENERATOR ? <SystemGeneratorMessage /> : <Outlet />}
      </AppShell>
    </ProtectedRoute>
  );
}

function CattleListRoute() {
  const navigate = useNavigate();
  return <CattleListPage onOpenCattle={(id) => navigate(`/cattle/${id}`)} />;
}

function CattleDetailRoute() {
  const { cattleId } = useParams<{ cattleId: string }>();
  const navigate = useNavigate();

  if (!cattleId) {
    return <Navigate replace to="/cattle" />;
  }

  return <CattleDetailPage cattleId={cattleId} onBackToList={() => navigate('/cattle')} />;
}

function AlertsListRoute() {
  const navigate = useNavigate();
  return <AlertsListPage onOpenAlert={(id) => navigate(`/alerts/${id}`)} />;
}

function AlertDetailRoute() {
  const { alertId } = useParams<{ alertId: string }>();
  const navigate = useNavigate();

  if (!alertId) {
    return <Navigate replace to="/alerts" />;
  }

  return <AlertDetailPage alertId={alertId} onBackToList={() => navigate('/alerts')} onOpenCattle={(id) => navigate(`/cattle/${id}`)} />;
}

function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <UiState
      title="Pagina no encontrada"
      description="No encontramos la ruta solicitada dentro del MVP web."
      action={
        <button className="button button--primary" onClick={() => navigate('/dashboard')} type="button">
          Ir al dashboard
        </button>
      }
    />
  );
}

export function AppRouter() {
  return (
    <Routes>
      <Route element={<AuthenticatedLayout />}>
        <Route index element={<Navigate replace to="/dashboard" />} />
        <Route element={<Navigate replace to="/dashboard" />} path="login" />
        <Route
          element={
            <ProtectedRoute allowedRoles={ANALYTICS_ROLES}>
              <DashboardPage />
            </ProtectedRoute>
          }
          path="dashboard"
        />
        <Route
          element={
            <ProtectedRoute allowedRoles={ANALYTICS_ROLES}>
              <CattleListRoute />
            </ProtectedRoute>
          }
          path="cattle"
        />
        <Route
          element={
            <ProtectedRoute allowedRoles={ANALYTICS_ROLES}>
              <CattleDetailRoute />
            </ProtectedRoute>
          }
          path="cattle/:cattleId"
        />
        <Route element={<AlertsListRoute />} path="alerts" />
        <Route element={<AlertDetailRoute />} path="alerts/:alertId" />
        <Route
          element={
            <ProtectedRoute allowedRoles={ADMIN_ROLES}>
              <UserListPage />
            </ProtectedRoute>
          }
          path="users"
        />
        <Route element={<NotFoundPage />} path="*" />
      </Route>
    </Routes>
  );
}
