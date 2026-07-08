import type { ApiClient } from '../../../shared/services/api-client';
import type { ApiEnvelope } from '../../../shared/types/api-envelope';
import type { DashboardMetrics } from '../domain';

export async function getDashboardMetrics(apiClient: ApiClient): Promise<DashboardMetrics> {
  const response = await apiClient.request<ApiEnvelope<DashboardMetrics>>('/dashboard');
  return response.data;
}
