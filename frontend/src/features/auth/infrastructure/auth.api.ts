import { ApiClient } from '../../../shared/services/api-client';
import type { ApiEnvelope } from '../../../shared/types/api-envelope';
import type { LoginRequestDto, LoginResponseDto } from '../domain';

export async function login(apiClient: ApiClient, request: LoginRequestDto): Promise<LoginResponseDto> {
  const response = await apiClient.request<ApiEnvelope<LoginResponseDto>>('/auth/login', {
    method: 'POST',
    body: request
  });

  return response.data;
}
