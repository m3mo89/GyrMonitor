import '@testing-library/jest-dom/vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it } from 'vitest';

import { AuthProvider, ProtectedRoute, Roles } from './';

const storageKey = 'gyrmonitor.auth.session';

describe('ProtectedRoute', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('shows login when the user is unauthenticated', () => {
    render(
      <MemoryRouter>
        <AuthProvider>
          <ProtectedRoute allowedRoles={[Roles.ADMIN]}>
            <p>Private content</p>
          </ProtectedRoute>
        </AuthProvider>
      </MemoryRouter>
    );

    expect(screen.getByRole('heading', { name: 'Iniciar sesion' })).toBeInTheDocument();
    expect(screen.queryByText('Private content')).not.toBeInTheDocument();
  });

  it('shows access denied for authenticated users without permission', () => {
    window.localStorage.setItem(
      storageKey,
      JSON.stringify({
        accessToken: 'token',
        user: { id: 'user-1', name: 'Operador', email: 'operator@gyrmonitor.local', role: Roles.FIELD_OPERATOR }
      })
    );

    render(
      <MemoryRouter>
        <AuthProvider>
          <ProtectedRoute allowedRoles={[Roles.ADMIN]}>
            <p>Private content</p>
          </ProtectedRoute>
        </AuthProvider>
      </MemoryRouter>
    );

    expect(screen.getByRole('heading', { name: 'Acceso denegado' })).toBeInTheDocument();
    expect(screen.queryByText('Private content')).not.toBeInTheDocument();
  });
});
