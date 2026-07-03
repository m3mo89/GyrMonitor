import { useQuery, type QueryKey, type UseQueryOptions, type UseQueryResult } from '@tanstack/react-query';

import { useAuth } from '../../features/auth/AuthProvider';
import type { ApiClient } from '../services/api-client';

export function useApiQuery<TData>(
  queryKey: QueryKey,
  queryFn: (apiClient: ApiClient) => Promise<TData>,
  options?: Omit<UseQueryOptions<TData>, 'queryKey' | 'queryFn'>
): UseQueryResult<TData> {
  const { apiClient } = useAuth();

  return useQuery<TData>({
    queryKey,
    queryFn: () => queryFn(apiClient),
    ...options
  });
}
