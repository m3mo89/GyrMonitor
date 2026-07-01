import type { ApiClient } from '../../shared/services/api-client';
import type { AlertDetail, AlertListItem, AlertListResult, AlertStatus, UpdateAlertStatusResult } from './alert.types';

type ApiEnvelope<T> = {
  success: true;
  data: T;
  pagination?: AlertListResult['pagination'];
};

export async function listAlerts(apiClient: ApiClient): Promise<AlertListResult> {
  const response = await apiClient.request<ApiEnvelope<AlertListItem[]>>('/alerts');

  return {
    data: response.data,
    pagination: response.pagination ?? {
      page: 1,
      pageSize: response.data.length,
      total: response.data.length
    }
  };
}

export async function getAlertDetail(apiClient: ApiClient, id: string): Promise<AlertDetail> {
  const response = await apiClient.request<ApiEnvelope<AlertDetail>>(`/alerts/${id}`);
  return response.data;
}

export async function updateAlertStatus(apiClient: ApiClient, id: string, status: AlertStatus): Promise<UpdateAlertStatusResult> {
  const body: { status: AlertStatus; attendedAt?: string } = { status };

  if (status === 'ATTENDED') {
    body.attendedAt = new Date().toISOString();
  }

  const response = await apiClient.request<ApiEnvelope<UpdateAlertStatusResult>>(`/alerts/${id}/status`, {
    method: 'PATCH',
    body
  });
  return response.data;
}
