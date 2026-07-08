import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import { Roles, useAuth } from '../../features/auth';

type NavItem = {
  path: string;
  labelKey: string;
  roles: string[];
};

const navItems: NavItem[] = [
  { path: '/dashboard', labelKey: 'navDashboard', roles: [Roles.ADMIN, Roles.RESEARCHER] },
  { path: '/cattle', labelKey: 'navCattle', roles: [Roles.ADMIN, Roles.RESEARCHER] },
  { path: '/alerts', labelKey: 'navAlerts', roles: [Roles.ADMIN, Roles.FIELD_OPERATOR, Roles.RESEARCHER] },
  { path: '/users', labelKey: 'navUsers', roles: [Roles.ADMIN] }
];

export function AppShell({
  children,
  currentPath,
  onNavigate
}: {
  children: ReactNode;
  currentPath: string;
  onNavigate(path: string): void;
}) {
  const { t } = useTranslation('app');
  const { session, clearSession } = useAuth();
  const visibleItems = navItems.filter((item) => !session || item.roles.includes(session.user.role));

  return (
    <div className="app-shell">
      <aside className="sidebar" aria-label={t('navAriaLabel')}>
        <div className="brand-lockup">
          <img alt="" aria-hidden="true" className="brand-mark" src="/favicon.svg" />
          <div>
            <strong>GyrMonitor</strong>
            <span>{t('tagline')}</span>
          </div>
        </div>
        <nav className="sidebar-nav">
          {visibleItems.map((item) => {
            const isActive = currentPath === item.path || currentPath.startsWith(`${item.path}/`);
            return (
              <button className={isActive ? 'nav-link nav-link--active' : 'nav-link'} key={item.path} onClick={() => onNavigate(item.path)} type="button">
                {t(item.labelKey)}
              </button>
            );
          })}
        </nav>
      </aside>
      <div className="app-shell__body">
        <header className="topbar">
          <div>
            <span className="topbar__label">{t('activeSession')}</span>
            <strong>{session?.user.name}</strong>
          </div>
          <span className="status-badge">{session?.user.role}</span>
          <button className="button button--ghost" onClick={clearSession} type="button">
            {t('closeSession')}
          </button>
        </header>
        <main className="content-area">{children}</main>
      </div>
    </div>
  );
}
