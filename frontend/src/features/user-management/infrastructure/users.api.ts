import type { ApiClient } from '../../../shared/services/api-client';
import type { ApiEnvelope } from '../../../shared/types/api-envelope';
import type { CreateUserRequest, ResetPasswordRequest, UserSummary } from '../domain';

export async function listUsers(apiClient: ApiClient): Promise<UserSummary[]> {
  const response = await apiClient.request<ApiEnvelope<UserSummary[]>>('/users');
  return response.data;
}

export async function createUser(apiClient: ApiClient, request: CreateUserRequest): Promise<UserSummary> {
  const response = await apiClient.request<ApiEnvelope<UserSummary>>('/users', { method: 'POST', body: request });
  return response.data;
}

export async function disableUser(apiClient: ApiClient, id: string): Promise<UserSummary> {
  const response = await apiClient.request<ApiEnvelope<UserSummary>>(`/users/${id}/disable`, { method: 'POST' });
  return response.data;
}

export async function reactivateUser(apiClient: ApiClient, id: string): Promise<UserSummary> {
  const response = await apiClient.request<ApiEnvelope<UserSummary>>(`/users/${id}/reactivate`, { method: 'POST' });
  return response.data;
}

export async function resetUserPassword(apiClient: ApiClient, id: string, request: ResetPasswordRequest): Promise<UserSummary> {
  const response = await apiClient.request<ApiEnvelope<UserSummary>>(`/users/${id}/reset-password`, { method: 'POST', body: request });
  return response.data;
}
