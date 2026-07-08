import '@testing-library/jest-dom/vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { Roles } from '../auth';
import { useCreateUser, useDisableUser, useReactivateUser, useResetUserPassword, useUsers } from './application';
import { UserListPage } from './presentation';

vi.mock('./application', () => ({
  useUsers: vi.fn(),
  useCreateUser: vi.fn(),
  useDisableUser: vi.fn(),
  useReactivateUser: vi.fn(),
  useResetUserPassword: vi.fn()
}));

const mockedUseUsers = vi.mocked(useUsers);
const mockedUseCreateUser = vi.mocked(useCreateUser);
const mockedUseDisableUser = vi.mocked(useDisableUser);
const mockedUseReactivateUser = vi.mocked(useReactivateUser);
const mockedUseResetUserPassword = vi.mocked(useResetUserPassword);

const activeUser = { id: 'user-1', name: 'Investigador', email: 'researcher@gyrmonitor.local', role: Roles.RESEARCHER, status: 'ACTIVE' as const };
const disabledUser = { id: 'user-2', name: 'Operador', email: 'field@gyrmonitor.local', role: Roles.FIELD_OPERATOR, status: 'DISABLED' as const };

function mockMutation(mutate: (...args: never[]) => unknown = vi.fn()) {
  return { mutate, isPending: false } as unknown;
}

describe('UserListPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockedUseCreateUser.mockReturnValue(mockMutation() as ReturnType<typeof useCreateUser>);
    mockedUseDisableUser.mockReturnValue(mockMutation() as ReturnType<typeof useDisableUser>);
    mockedUseReactivateUser.mockReturnValue(mockMutation() as ReturnType<typeof useReactivateUser>);
    mockedUseResetUserPassword.mockReturnValue(mockMutation() as ReturnType<typeof useResetUserPassword>);
  });

  afterEach(() => {
    cleanup();
  });

  it('shows loading state', () => {
    mockedUseUsers.mockReturnValue({ isLoading: true, isError: false, data: undefined } as unknown as ReturnType<typeof useUsers>);

    render(<UserListPage />);

    expect(screen.getByText('Cargando usuarios...')).toBeInTheDocument();
  });

  it('renders users with name, email, role and status', () => {
    mockedUseUsers.mockReturnValue({ isLoading: false, isError: false, data: [activeUser, disabledUser] } as unknown as ReturnType<typeof useUsers>);

    render(<UserListPage />);

    expect(screen.getByRole('heading', { name: 'Usuarios' })).toBeInTheDocument();
    expect(screen.getByText('Investigador')).toBeInTheDocument();
    expect(screen.getByText('researcher@gyrmonitor.local')).toBeInTheDocument();
    expect(screen.getByText('ACTIVE')).toBeInTheDocument();
    expect(screen.getByText('DISABLED')).toBeInTheDocument();
  });

  it('submits the create-user form with the entered data', () => {
    mockedUseUsers.mockReturnValue({ isLoading: false, isError: false, data: [] } as unknown as ReturnType<typeof useUsers>);
    const mutate = vi.fn();
    mockedUseCreateUser.mockReturnValue(mockMutation(mutate) as ReturnType<typeof useCreateUser>);

    render(<UserListPage />);

    fireEvent.change(screen.getByLabelText('Nombre'), { target: { value: 'Nuevo Usuario' } });
    fireEvent.change(screen.getByLabelText('Correo'), { target: { value: 'nuevo@gyrmonitor.local' } });
    fireEvent.change(screen.getByLabelText('Contrasena inicial'), { target: { value: 'a-strong-password' } });
    fireEvent.click(screen.getByRole('button', { name: 'Crear usuario' }));

    expect(mutate).toHaveBeenCalledWith(
      { name: 'Nuevo Usuario', email: 'nuevo@gyrmonitor.local', role: Roles.FIELD_OPERATOR, password: 'a-strong-password' },
      expect.objectContaining({ onSuccess: expect.any(Function), onError: expect.any(Function) })
    );
  });

  it('shows a client-side error for a short password without calling the API', () => {
    mockedUseUsers.mockReturnValue({ isLoading: false, isError: false, data: [] } as unknown as ReturnType<typeof useUsers>);
    const mutate = vi.fn();
    mockedUseCreateUser.mockReturnValue(mockMutation(mutate) as ReturnType<typeof useCreateUser>);

    render(<UserListPage />);

    fireEvent.change(screen.getByLabelText('Nombre'), { target: { value: 'Nuevo Usuario' } });
    fireEvent.change(screen.getByLabelText('Correo'), { target: { value: 'nuevo@gyrmonitor.local' } });
    fireEvent.change(screen.getByLabelText('Contrasena inicial'), { target: { value: 'short' } });
    fireEvent.click(screen.getByRole('button', { name: 'Crear usuario' }));

    expect(screen.getByText('La contrasena debe tener al menos 8 caracteres.')).toBeInTheDocument();
    expect(mutate).not.toHaveBeenCalled();
  });

  it('shows the backend validation message when create fails', () => {
    mockedUseUsers.mockReturnValue({ isLoading: false, isError: false, data: [] } as unknown as ReturnType<typeof useUsers>);
    const mutate = vi.fn((_variables: unknown, options: { onError?: (error: unknown) => void }) => {
      options.onError?.({ success: false, error: { code: 'VALIDATION_ERROR', message: 'A user with email nuevo@gyrmonitor.local already exists.' } });
    });
    mockedUseCreateUser.mockReturnValue(mockMutation(mutate) as ReturnType<typeof useCreateUser>);

    render(<UserListPage />);

    fireEvent.change(screen.getByLabelText('Nombre'), { target: { value: 'Nuevo Usuario' } });
    fireEvent.change(screen.getByLabelText('Correo'), { target: { value: 'nuevo@gyrmonitor.local' } });
    fireEvent.change(screen.getByLabelText('Contrasena inicial'), { target: { value: 'a-strong-password' } });
    fireEvent.click(screen.getByRole('button', { name: 'Crear usuario' }));

    expect(screen.getByText('A user with email nuevo@gyrmonitor.local already exists.')).toBeInTheDocument();
  });

  it('disables an active user from the row action', () => {
    mockedUseUsers.mockReturnValue({ isLoading: false, isError: false, data: [activeUser] } as unknown as ReturnType<typeof useUsers>);
    const mutate = vi.fn();
    mockedUseDisableUser.mockReturnValue(mockMutation(mutate) as ReturnType<typeof useDisableUser>);

    render(<UserListPage />);

    fireEvent.click(screen.getByRole('button', { name: 'Deshabilitar' }));

    expect(mutate).toHaveBeenCalledWith(activeUser.id);
  });

  it('reactivates a disabled user from the row action', () => {
    mockedUseUsers.mockReturnValue({ isLoading: false, isError: false, data: [disabledUser] } as unknown as ReturnType<typeof useUsers>);
    const mutate = vi.fn();
    mockedUseReactivateUser.mockReturnValue(mockMutation(mutate) as ReturnType<typeof useReactivateUser>);

    render(<UserListPage />);

    fireEvent.click(screen.getByRole('button', { name: 'Reactivar' }));

    expect(mutate).toHaveBeenCalledWith(disabledUser.id);
  });
});
