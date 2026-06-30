import type { ActivityEvent, ActivityEventDto, EventType, RegisterActivityEventResponseDto, SourceType } from '../domain/activity-event';

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

export type RegisterActivityEventCommand = {
  eventId: string;
  deviceId: string;
  cattleId: string;
  eventType: string;
  inactiveMinutes?: number;
  confidence: number;
  capturedAt: string;
  source: string;
  idempotencyKey?: string;
};

export type RegisterActivityEventRequestDto = {
  eventId: string;
  deviceId: string;
  cattleId: string;
  eventType: string;
  inactiveMinutes?: number;
  confidence: number;
  capturedAt: string;
  source: string;
};

export type RegisterActivityEventResultDto = RegisterActivityEventResponseDto;

export type ListActivityEventsQuery = PaginationRequest & {
  cattleId?: string;
  eventType?: string;
  from?: string;
  to?: string;
};

export type NormalizedActivityEventsQuery = Required<PaginationRequest> & {
  cattleId?: string;
  eventType?: EventType;
  from?: string;
  to?: string;
};

export type ActivityEventListResponseDto = PaginatedResult<ActivityEventDto>;

export type CattleActivityEventHistoryDto = {
  cattleId: string;
  events: ActivityEventDto[];
  pagination: PaginationMetadata;
};

export type ActivityEventRepository = {
  save(event: ActivityEvent): Promise<ActivityEvent>;
  findByEventId(eventId: string): Promise<ActivityEvent | null>;
  list(query: NormalizedActivityEventsQuery): Promise<PaginatedResult<ActivityEvent>>;
};

export type CattleLookup = {
  exists(id: string): Promise<boolean>;
};

export type CreateActivityEventInput = {
  id: string;
  eventId: string;
  deviceId: string;
  cattleId: string;
  eventType: EventType;
  inactiveMinutes?: number;
  confidence: number;
  capturedAt: string;
  source: SourceType;
  createdAt: string;
};
