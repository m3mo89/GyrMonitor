import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { useAuth } from '../auth/AuthProvider';
import { createUser, disableUser, listUsers, reactivateUser, resetUserPassword } from './users.api';
import type { CreateUserRequest, ResetPasswordRequest } from './users.types';

const usersQueryKey = ['users', 'list'];

export function useUsers() {
  const { apiClient } = useAuth();

  return useQuery({
    queryKey: usersQueryKey,
    queryFn: () => listUsers(apiClient)
  });
}

export function useCreateUser() {
  const { apiClient } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: CreateUserRequest) => createUser(apiClient, request),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: usersQueryKey })
  });
}

export function useDisableUser() {
  const { apiClient } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => disableUser(apiClient, id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: usersQueryKey })
  });
}

export function useReactivateUser() {
  const { apiClient } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => reactivateUser(apiClient, id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: usersQueryKey })
  });
}

export function useResetUserPassword() {
  const { apiClient } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, request }: { id: string; request: ResetPasswordRequest }) => resetUserPassword(apiClient, id, request),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: usersQueryKey })
  });
}
