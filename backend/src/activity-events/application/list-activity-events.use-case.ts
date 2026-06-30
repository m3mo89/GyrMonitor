import { InvalidActivityEventInputError } from './activity-event.errors';
import type { ActivityEventListResponseDto, ActivityEventRepository, ListActivityEventsQuery, NormalizedActivityEventsQuery } from './activity-event.types';
import { assertEventType, assertIsoDateTime, assertUuid, toActivityEventDto } from '../domain/activity-event';

export class ListActivityEventsUseCase {
  private readonly events: ActivityEventRepository;

  constructor(events: ActivityEventRepository) {
    this.events = events;
  }

  async execute(query: ListActivityEventsQuery = {}): Promise<ActivityEventListResponseDto> {
    try {
      const normalized = normalizeQuery(query);
      const result = await this.events.list(normalized);

      return {
        data: result.data.map(toActivityEventDto),
        pagination: result.pagination
      };
    } catch (error) {
      if (error instanceof Error) {
        throw new InvalidActivityEventInputError(error.message);
      }

      throw error;
    }
  }
}

export function normalizeQuery(query: ListActivityEventsQuery): NormalizedActivityEventsQuery {
  const normalized: NormalizedActivityEventsQuery = {
    page: normalizePositiveInteger(query.page, 1),
    pageSize: Math.min(normalizePositiveInteger(query.pageSize, 20), 100)
  };

  if (query.cattleId) {
    assertUuid(query.cattleId, 'cattleId');
    normalized.cattleId = query.cattleId;
  }

  if (query.eventType) {
    assertEventType(query.eventType);
    normalized.eventType = query.eventType;
  }

  if (query.from) {
    assertIsoDateTime(query.from, 'from');
    normalized.from = query.from;
  }

  if (query.to) {
    assertIsoDateTime(query.to, 'to');
    normalized.to = query.to;
  }

  return normalized;
}

function normalizePositiveInteger(value: number | undefined, fallback: number): number {
  if (!Number.isInteger(value) || !value || value < 1) {
    return fallback;
  }

  return value;
}
