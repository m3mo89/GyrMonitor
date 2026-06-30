import { CattleNotFoundError, InvalidCattleIdError } from './cattle.errors';
import type { CattleHistoryDto, CattleRepository, PaginationRequest } from './cattle.types';
import { isUuid } from './uuid';
import type { ActivityEventRepository } from '../../activity-events/application/activity-event.types';
import { toActivityEventDto } from '../../activity-events/domain/activity-event';

export class GetCattleHistoryUseCase {
  private readonly cattle: CattleRepository;
  private readonly events: ActivityEventRepository;

  constructor(cattle: CattleRepository, events: ActivityEventRepository) {
    this.cattle = cattle;
    this.events = events;
  }

  async execute(id: string, request: PaginationRequest = {}): Promise<CattleHistoryDto> {
    if (!isUuid(id)) {
      throw new InvalidCattleIdError();
    }

    if (!(await this.cattle.exists(id))) {
      throw new CattleNotFoundError();
    }

    const page = normalizePositiveInteger(request.page, 1);
    const pageSize = Math.min(normalizePositiveInteger(request.pageSize, 20), 100);
    const result = await this.events.list({ cattleId: id, page, pageSize });

    return {
      cattleId: id,
      events: result.data.map(toActivityEventDto),
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
