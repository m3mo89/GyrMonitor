import type { Cattle, CattleDetailDto, CattleSummaryDto } from '../domain/cattle';
import type { ActivityEventDto } from '../../activity-events/domain/activity-event';

export type PaginationRequest = {
  page?: number;
  pageSize?: number;
};

export type PaginationMetadata = {
  page: number;
  pageSize: number;
  total: number;
};

export type PaginatedResult<T> = {
  data: T[];
  pagination: PaginationMetadata;
};

export type CattleHistoryDto = {
  cattleId: string;
  events: ActivityEventDto[];
  pagination: PaginationMetadata;
};

export type CattleRepository = {
  list(request: Required<PaginationRequest>): Promise<PaginatedResult<Cattle>>;
  findById(id: string): Promise<Cattle | null>;
  exists(id: string): Promise<boolean>;
};

export type CattleListResponseDto = PaginatedResult<CattleSummaryDto>;
export type CattleDetailResponseDto = CattleDetailDto;
