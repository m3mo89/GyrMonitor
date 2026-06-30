import type { CattleListResponseDto, CattleRepository, PaginationRequest } from './cattle.types';
import { toCattleSummaryDto } from '../domain/cattle';

export class ListCattleUseCase {
  private readonly cattle: CattleRepository;

  constructor(cattle: CattleRepository) {
    this.cattle = cattle;
  }

  async execute(request: PaginationRequest = {}): Promise<CattleListResponseDto> {
    const page = normalizePositiveInteger(request.page, 1);
    const pageSize = Math.min(normalizePositiveInteger(request.pageSize, 20), 100);
    const result = await this.cattle.list({ page, pageSize });

    return {
      data: result.data.map(toCattleSummaryDto),
      pagination: result.pagination
    };
  }
}

function normalizePositiveInteger(value: number | undefined, fallback: number): number {
  if (!Number.isInteger(value) || !value || value < 1) {
    return fallback;
  }

  return value;
}
