import { useQuery } from '@tanstack/react-query';

import { useAuth } from '../auth/AuthProvider';
import { getDashboardMetrics } from './dashboard.api';

export function useDashboardMetrics() {
  const { apiClient } = useAuth();

  return useQuery({
    queryKey: ['dashboard', 'metrics'],
    queryFn: () => getDashboardMetrics(apiClient),
    staleTime: 30_000
  });
}
