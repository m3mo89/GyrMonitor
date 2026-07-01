import '@testing-library/jest-dom/vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';

import { App } from './App';
import { Roles } from '../features/auth/auth.types';

const storageKey = 'gyrmonitor.auth.session';

describe('App routes', () => {
  beforeEach(() => {
    window.localStorage.clear();
    window.history.replaceState(null, '', '/dashboard');
  });

  it('shows a dedicated integration-account message for SYSTEM_GENERATOR users', () => {
    window.localStorage.setItem(
      storageKey,
      JSON.stringify({
        accessToken: 'token',
        user: { id: 'system-1', name: 'System Generator', email: 'system@gyrmonitor.local', role: Roles.SYSTEM_GENERATOR }
      })
    );

    render(<App />);

    expect(screen.getByRole('heading', { name: 'Cuenta de integracion' })).toBeInTheDocument();
    expect(screen.getByText(/ingestion de eventos desde simulador, cliente desktop o datos controlados/i)).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Acceso denegado' })).not.toBeInTheDocument();

    fireEvent.click(screen.getAllByRole('button', { name: 'Cerrar sesion' })[1]);

    expect(screen.getByRole('heading', { name: 'Iniciar sesion' })).toBeInTheDocument();
    expect(window.localStorage.getItem(storageKey)).toBeNull();
  });
});
