import type { ApiClient } from '../../shared/services/api-client';
import type { DashboardMetrics } from './dashboard.types';

type ApiEnvelope<T> = {
  success: true;
  data: T;
};

export async function getDashboardMetrics(apiClient: ApiClient): Promise<DashboardMetrics> {
  const response = await apiClient.request<ApiEnvelope<DashboardMetrics>>('/dashboard');
  return response.data;
}
