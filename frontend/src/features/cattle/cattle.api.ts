import type { ApiClient } from '../../shared/services/api-client';
import type { CattleDetail, CattleHistoryPlaceholder, CattleSummary, PaginationMetadata } from './cattle.types';

type ApiEnvelope<T> = {
  success: true;
  data: T;
  pagination?: PaginationMetadata;
};

export type CattleListResult = {
  data: CattleSummary[];
  pagination: PaginationMetadata;
};

export async function listCattle(apiClient: ApiClient): Promise<CattleListResult> {
  const response = await apiClient.request<ApiEnvelope<CattleSummary[]>>('/cattle');

  return {
    data: response.data,
    pagination: response.pagination ?? {
      page: 1,
      pageSize: response.data.length,
      total: response.data.length
    }
  };
}

export async function getCattleDetail(apiClient: ApiClient, id: string): Promise<CattleDetail> {
  const response = await apiClient.request<ApiEnvelope<CattleDetail>>(`/cattle/${id}`);
  return response.data;
}

export async function getCattleHistory(apiClient: ApiClient, id: string): Promise<CattleHistoryPlaceholder> {
  const response = await apiClient.request<ApiEnvelope<CattleHistoryPlaceholder>>(`/cattle/${id}/events`);
  return response.data;
}
