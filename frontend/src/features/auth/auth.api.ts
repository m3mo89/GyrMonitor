import { ApiClient } from '../../shared/services/api-client';
import type { LoginRequestDto, LoginResponseDto } from './auth.types';

type ApiEnvelope<T> = {
  success: true;
  data: T;
};

export async function login(apiClient: ApiClient, request: LoginRequestDto): Promise<LoginResponseDto> {
  const response = await apiClient.request<ApiEnvelope<LoginResponseDto>>('/auth/login', {
    method: 'POST',
    body: request
  });

  return response.data;
}
