import { useState, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';

import { LoadingState, UiState } from '../../../shared/components/UiState';
import { Roles, type Role } from '../../auth/domain/auth.types';
import { useCreateUser, useDisableUser, useReactivateUser, useResetUserPassword, useUsers } from '../application';
import { minimumPasswordLength, validatePasswordLength, validateRequiredUserFields } from '../domain';

const roleOptions: Role[] = [Roles.ADMIN, Roles.RESEARCHER, Roles.FIELD_OPERATOR, Roles.SYSTEM_GENERATOR];

function extractErrorMessage(error: unknown, fallback: string): string {
  if (error && typeof error === 'object' && 'error' in error) {
    const message = (error as { error?: { message?: string } }).error?.message;
    if (message) {
      return message;
    }
  }

  return error instanceof Error && error.message ? error.message : fallback;
}

export function UserListPage() {
  const { t } = useTranslation('userManagement');
  const users = useUsers();
  const createUser = useCreateUser();
  const disableUser = useDisableUser();
  const reactivateUser = useReactivateUser();
  const resetPassword = useResetUserPassword();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<Role>(Roles.FIELD_OPERATOR);
  const [password, setPassword] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const [resettingUserId, setResettingUserId] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [resetError, setResetError] = useState<string | null>(null);

  function handleCreateSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);

    const validationError = validateRequiredUserFields(name, email, password) ?? validatePasswordLength(password);
    if (validationError) {
      setFormError(validationError);
      return;
    }

    createUser.mutate(
      { name, email, role, password },
      {
        onSuccess: () => {
          setName('');
          setEmail('');
          setPassword('');
          setRole(Roles.FIELD_OPERATOR);
        },
        onError: (error) => setFormError(extractErrorMessage(error, t('createGenericError')))
      }
    );
  }

  function handleResetSubmit(event: FormEvent<HTMLFormElement>, userId: string) {
    event.preventDefault();
    setResetError(null);

    const validationError = validatePasswordLength(newPassword);
    if (validationError) {
      setResetError(validationError);
      return;
    }

    resetPassword.mutate(
      { id: userId, request: { newPassword } },
      {
        onSuccess: () => {
          setResettingUserId(null);
          setNewPassword('');
        },
        onError: (error) => setResetError(extractErrorMessage(error, t('resetPasswordGenericError')))
      }
    );
  }

  if (users.isLoading) {
    return <LoadingState title={t('loading')} />;
  }

  if (users.isError) {
    return <UiState description={t('errorDescription')} title={t('errorTitle')} tone="danger" />;
  }

  const data = users.data ?? [];

  return (
    <div className="page-stack">
      <header className="page-header">
        <div>
          <p className="eyebrow">{t('eyebrow')}</p>
          <h1>{t('title')}</h1>
          <p>{t('subtitle', { count: data.length })}</p>
        </div>
      </header>

      <section className="panel">
        <div className="panel__header">
          <div>
            <h2>{t('createSectionTitle')}</h2>
            <p>{t('createSectionSubtitle')}</p>
          </div>
        </div>
        <form aria-label={t('createFormAriaLabel')} className="form-stack" onSubmit={handleCreateSubmit}>
          <label className="field">
            {t('nameLabel')}
            <input name="name" onChange={(event) => setName(event.target.value)} type="text" value={name} />
          </label>
          <label className="field">
            {t('emailLabel')}
            <input name="email" onChange={(event) => setEmail(event.target.value)} type="email" value={email} />
          </label>
          <label className="field">
            {t('roleLabel')}
            <select name="role" onChange={(event) => setRole(event.target.value as Role)} value={role}>
              {roleOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            {t('initialPasswordLabel')}
            <input name="password" onChange={(event) => setPassword(event.target.value)} type="password" value={password} />
          </label>
          <p className="field-hint">{t('passwordHint', { minimumLength: minimumPasswordLength })}</p>
          {formError ? (
            <p className="status-badge status-badge--danger" role="alert">
              {formError}
            </p>
          ) : null}
          <button className="button button--primary" disabled={createUser.isPending} type="submit">
            {createUser.isPending ? t('createSubmitting') : t('createSubmit')}
          </button>
        </form>
      </section>

      {data.length === 0 ? (
        <UiState description={t('emptyDescription')} title={t('emptyTitle')} />
      ) : (
        <div className="data-table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>{t('columnName')}</th>
                <th>{t('columnEmail')}</th>
                <th>{t('columnRole')}</th>
                <th>{t('columnStatus')}</th>
                <th>{t('columnActions')}</th>
              </tr>
            </thead>
            <tbody>
              {data.map((user) => (
                <tr key={user.id}>
                  <td>
                    <strong>{user.name}</strong>
                  </td>
                  <td>{user.email}</td>
                  <td>{user.role}</td>
                  <td>
                    <span className={user.status === 'ACTIVE' ? 'status-badge' : 'status-badge status-badge--warning'}>{user.status}</span>
                  </td>
                  <td>
                    <div className="table-actions">
                      {user.status === 'ACTIVE' ? (
                        <button
                          className="button button--ghost"
                          disabled={disableUser.isPending}
                          onClick={() => disableUser.mutate(user.id)}
                          type="button"
                        >
                          {t('disable')}
                        </button>
                      ) : (
                        <button
                          className="button button--ghost"
                          disabled={reactivateUser.isPending}
                          onClick={() => reactivateUser.mutate(user.id)}
                          type="button"
                        >
                          {t('reactivate')}
                        </button>
                      )}
                      {resettingUserId === user.id ? (
                        <div className="reset-password-wrap">
                          <form className="reset-password-form" onSubmit={(event) => handleResetSubmit(event, user.id)}>
                            <input
                              aria-label={t('resetPasswordAriaLabel', { name: user.name })}
                              onChange={(event) => setNewPassword(event.target.value)}
                              type="password"
                              value={newPassword}
                            />
                            <button className="button button--primary" disabled={resetPassword.isPending} type="submit">
                              {t('save')}
                            </button>
                            <button
                              className="button button--ghost"
                              onClick={() => {
                                setResettingUserId(null);
                                setNewPassword('');
                                setResetError(null);
                              }}
                              type="button"
                            >
                              {t('cancel')}
                            </button>
                          </form>
                          <p className="field-hint">{t('passwordHint', { minimumLength: minimumPasswordLength })}</p>
                          {resetError ? (
                            <p className="status-badge status-badge--danger" role="alert">
                              {resetError}
                            </p>
                          ) : null}
                        </div>
                      ) : (
                        <button
                          className="button button--ghost"
                          onClick={() => {
                            setResettingUserId(user.id);
                            setResetError(null);
                          }}
                          type="button"
                        >
                          {t('resetPassword')}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
