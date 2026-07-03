import { ActivityEventCattleNotFoundError, InvalidActivityEventInputError } from './activity-event.errors';
import type { ActivityEventRepository, CattleActivityEventHistoryDto, CattleLookup, PaginationRequest } from './activity-event.types';
import { toActivityEventDto } from '../domain/activity-event';
import { assertUuid } from '../../shared/validation/assertions';

export class GetCattleActivityEventHistoryUseCase {
  private readonly events: ActivityEventRepository;
  private readonly cattle: CattleLookup;

  constructor(events: ActivityEventRepository, cattle: CattleLookup) {
    this.events = events;
    this.cattle = cattle;
  }

  async execute(cattleId: string, request: PaginationRequest = {}): Promise<CattleActivityEventHistoryDto> {
    try {
      assertUuid(cattleId, 'cattleId');

      if (!(await this.cattle.exists(cattleId))) {
        throw new ActivityEventCattleNotFoundError();
      }

      const result = await this.events.list({
        cattleId,
        page: normalizePositiveInteger(request.page, 1),
        pageSize: Math.min(normalizePositiveInteger(request.pageSize, 20), 100)
      });

      return {
        cattleId,
        events: result.data.map(toActivityEventDto),
        pagination: result.pagination
      };
    } catch (error) {
      if (error instanceof ActivityEventCattleNotFoundError) {
        throw error;
      }

      if (error instanceof Error) {
        throw new InvalidActivityEventInputError(error.message);
      }

      throw error;
    }
  }
}

function normalizePositiveInteger(value: number | undefined, fallback: number): number {
  if (!Number.isInteger(value) || !value || value < 1) {
    return fallback;
  }

  return value;
}
