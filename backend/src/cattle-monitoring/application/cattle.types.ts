import type { Cattle, CattleDetailDto, CattleSummaryDto } from '../domain/cattle';

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

export type CattleHistoryPlaceholderDto = {
  cattleId: string;
  events: [];
  pagination: PaginationMetadata;
  placeholder: true;
  message: string;
};

export type CattleRepository = {
  list(request: Required<PaginationRequest>): Promise<PaginatedResult<Cattle>>;
  findById(id: string): Promise<Cattle | null>;
  exists(id: string): Promise<boolean>;
};

export type CattleListResponseDto = PaginatedResult<CattleSummaryDto>;
export type CattleDetailResponseDto = CattleDetailDto;
