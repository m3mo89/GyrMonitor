import { useAuth } from '../presentation/AuthProvider';
import { login } from '../infrastructure';
import type { LoginRequestDto } from '../domain';

export function useLogin() {
  const { apiClient, setSession } = useAuth();

  return async function authenticate(request: LoginRequestDto) {
    const response = await login(apiClient, request);
    setSession({ accessToken: response.accessToken, user: response.user });
    return response;
  };
}
