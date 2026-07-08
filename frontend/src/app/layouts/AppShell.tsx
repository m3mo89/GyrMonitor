import type { ReactNode } from 'react';

import { Roles } from '../../features/auth/auth.types';
import { useAuth } from '../../features/auth/AuthProvider';

type NavItem = {
  path: string;
  label: string;
  roles: string[];
};

const navItems: NavItem[] = [
  { path: '/dashboard', label: 'Dashboard', roles: [Roles.ADMIN, Roles.RESEARCHER] },
  { path: '/cattle', label: 'Cattle', roles: [Roles.ADMIN, Roles.RESEARCHER] },
  { path: '/alerts', label: 'Alertas', roles: [Roles.ADMIN, Roles.FIELD_OPERATOR, Roles.RESEARCHER] },
  { path: '/users', label: 'Usuarios', roles: [Roles.ADMIN] }
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
  const { session, clearSession } = useAuth();
  const visibleItems = navItems.filter((item) => !session || item.roles.includes(session.user.role));

  return (
    <div className="app-shell">
      <aside className="sidebar" aria-label="Navegacion principal">
        <div className="brand-lockup">
          <img alt="" aria-hidden="true" className="brand-mark" src="/favicon.svg" />
          <div>
            <strong>GyrMonitor</strong>
            <span>MVP operativo</span>
          </div>
        </div>
        <nav className="sidebar-nav">
          {visibleItems.map((item) => {
            const isActive = currentPath === item.path || currentPath.startsWith(`${item.path}/`);
            return (
              <button className={isActive ? 'nav-link nav-link--active' : 'nav-link'} key={item.path} onClick={() => onNavigate(item.path)} type="button">
                {item.label}
              </button>
            );
          })}
        </nav>
      </aside>
      <div className="app-shell__body">
        <header className="topbar">
          <div>
            <span className="topbar__label">Sesion activa</span>
            <strong>{session?.user.name}</strong>
          </div>
          <span className="status-badge">{session?.user.role}</span>
          <button className="button button--ghost" onClick={clearSession} type="button">
            Cerrar sesion
          </button>
        </header>
        <main className="content-area">{children}</main>
      </div>
    </div>
  );
}
