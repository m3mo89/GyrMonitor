import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

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
  const { t } = useTranslation('auth');
  const { session } = useAuth();

  if (!session) {
    return <LoginPage onAuthenticated={onAuthenticated} />;
  }

  if (allowedRoles && !allowedRoles.includes(session.user.role)) {
    return (
      <main>
        <h1>{t('accessDenied.title')}</h1>
        <p>{t('accessDenied.description')}</p>
      </main>
    );
  }

  return <>{children}</>;
}
