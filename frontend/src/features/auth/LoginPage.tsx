import { FormEvent, useState } from 'react';

import { login } from './auth.api';
import { useAuth } from './AuthProvider';

export function LoginPage({ onAuthenticated }: { onAuthenticated: () => void }) {
  const { apiClient, setSession } = useAuth();
  const [email, setEmail] = useState('admin@gyrmonitor.local');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!email.trim() || !password) {
      setError('Ingresa correo y contrasena.');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await login(apiClient, { email, password });
      setPassword('');
      setSession({ accessToken: response.accessToken, user: response.user });
      window.history.replaceState(null, '', '/dashboard');
      onAuthenticated();
    } catch {
      setPassword('');
      setError('No se pudo iniciar sesion con esas credenciales.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="auth-screen">
      <section className="auth-card">
        <p className="eyebrow">GyrMonitor</p>
        <h1>Iniciar sesion</h1>
        <p>Accede al monitoreo operativo de cattle, alertas y dashboard del MVP.</p>
        <form className="form-stack" onSubmit={handleSubmit} aria-label="Iniciar sesion">
          <label className="field">
          Correo
            <input
              autoComplete="username"
              name="email"
              onChange={(event) => setEmail(event.target.value)}
              type="email"
              value={email}
            />
          </label>
          <label className="field">
          Contrasena
            <input
              autoComplete="current-password"
              name="password"
              onChange={(event) => setPassword(event.target.value)}
              type="password"
              value={password}
            />
          </label>
          {error ? (
            <p className="status-badge status-badge--danger" role="alert">
              {error}
            </p>
          ) : null}
          <button className="button button--primary" disabled={isSubmitting} type="submit">
            {isSubmitting ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
      </section>
    </main>
  );
}
