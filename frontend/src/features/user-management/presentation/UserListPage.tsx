import { useState, type FormEvent } from 'react';

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
        onError: (error) => setFormError(extractErrorMessage(error, 'No se pudo crear el usuario. Verifica los datos e intenta nuevamente.'))
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
        onError: (error) => setResetError(extractErrorMessage(error, 'No se pudo restablecer la contrasena.'))
      }
    );
  }

  if (users.isLoading) {
    return <LoadingState title="Cargando usuarios..." />;
  }

  if (users.isError) {
    return <UiState description="No se pudo cargar el listado de usuarios." title="No se pudo cargar usuarios" tone="danger" />;
  }

  const data = users.data ?? [];

  return (
    <div className="page-stack">
      <header className="page-header">
        <div>
          <p className="eyebrow">Administracion</p>
          <h1>Usuarios</h1>
          <p>{data.length} usuarios registrados. Los usuarios no se eliminan, solo se deshabilitan.</p>
        </div>
      </header>

      <section className="panel">
        <div className="panel__header">
          <div>
            <h2>Crear usuario</h2>
            <p>Provisiona una cuenta real con rol asignado.</p>
          </div>
        </div>
        <form aria-label="Crear usuario" className="form-stack" onSubmit={handleCreateSubmit}>
          <label className="field">
            Nombre
            <input name="name" onChange={(event) => setName(event.target.value)} type="text" value={name} />
          </label>
          <label className="field">
            Correo
            <input name="email" onChange={(event) => setEmail(event.target.value)} type="email" value={email} />
          </label>
          <label className="field">
            Rol
            <select name="role" onChange={(event) => setRole(event.target.value as Role)} value={role}>
              {roleOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            Contrasena inicial
            <input name="password" onChange={(event) => setPassword(event.target.value)} type="password" value={password} />
          </label>
          <p className="field-hint">Minimo {minimumPasswordLength} caracteres.</p>
          {formError ? (
            <p className="status-badge status-badge--danger" role="alert">
              {formError}
            </p>
          ) : null}
          <button className="button button--primary" disabled={createUser.isPending} type="submit">
            {createUser.isPending ? 'Creando...' : 'Crear usuario'}
          </button>
        </form>
      </section>

      {data.length === 0 ? (
        <UiState description="Crea el primer usuario con el formulario de arriba." title="No hay usuarios registrados" />
      ) : (
        <div className="data-table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Correo</th>
                <th>Rol</th>
                <th>Estado</th>
                <th>Acciones</th>
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
                          Deshabilitar
                        </button>
                      ) : (
                        <button
                          className="button button--ghost"
                          disabled={reactivateUser.isPending}
                          onClick={() => reactivateUser.mutate(user.id)}
                          type="button"
                        >
                          Reactivar
                        </button>
                      )}
                      {resettingUserId === user.id ? (
                        <div className="reset-password-wrap">
                          <form className="reset-password-form" onSubmit={(event) => handleResetSubmit(event, user.id)}>
                            <input
                              aria-label={`Nueva contrasena para ${user.name}`}
                              onChange={(event) => setNewPassword(event.target.value)}
                              type="password"
                              value={newPassword}
                            />
                            <button className="button button--primary" disabled={resetPassword.isPending} type="submit">
                              Guardar
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
                              Cancelar
                            </button>
                          </form>
                          <p className="field-hint">Minimo {minimumPasswordLength} caracteres.</p>
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
                          Restablecer contrasena
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
