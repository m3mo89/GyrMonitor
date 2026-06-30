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
    <main>
      <h1>GyrMonitor</h1>
      <form onSubmit={handleSubmit} aria-label="Iniciar sesion">
        <label>
          Correo
          <input
            autoComplete="username"
            name="email"
            onChange={(event) => setEmail(event.target.value)}
            type="email"
            value={email}
          />
        </label>
        <label>
          Contrasena
          <input
            autoComplete="current-password"
            name="password"
            onChange={(event) => setPassword(event.target.value)}
            type="password"
            value={password}
          />
        </label>
        {error ? <p role="alert">{error}</p> : null}
        <button disabled={isSubmitting} type="submit">
          {isSubmitting ? 'Entrando...' : 'Entrar'}
        </button>
      </form>
    </main>
  );
}
