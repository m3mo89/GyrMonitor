import { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { useLogin } from '../application';

export function LoginPage({ onAuthenticated }: { onAuthenticated: () => void }) {
  const { t } = useTranslation('auth');
  const authenticate = useLogin();
  const navigate = useNavigate();
  const [email, setEmail] = useState('admin@gyrmonitor.local');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!email.trim() || !password) {
      setError(t('login.validationError'));
      return;
    }

    setIsSubmitting(true);

    try {
      await authenticate({ email, password });
      setPassword('');
      navigate('/dashboard', { replace: true });
      onAuthenticated();
    } catch {
      setPassword('');
      setError(t('login.authError'));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="auth-screen">
      <section className="auth-card">
        <p className="eyebrow">{t('login.eyebrow')}</p>
        <h1>{t('login.title')}</h1>
        <p>{t('login.subtitle')}</p>
        <form className="form-stack" onSubmit={handleSubmit} aria-label={t('login.formAriaLabel')}>
          <label className="field">
            {t('login.emailLabel')}
            <input
              autoComplete="username"
              name="email"
              onChange={(event) => setEmail(event.target.value)}
              type="email"
              value={email}
            />
          </label>
          <label className="field">
            {t('login.passwordLabel')}
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
            {isSubmitting ? t('login.submitting') : t('login.submit')}
          </button>
        </form>
      </section>
    </main>
  );
}
