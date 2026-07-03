export const EventTypes = {
  ACTIVITY: 'ACTIVITY',
  INACTIVITY: 'INACTIVITY'
} as const;

export type EventType = (typeof EventTypes)[keyof typeof EventTypes];

export const SourceTypes = {
  DESKTOP_SIMULATOR: 'DESKTOP_SIMULATOR',
  MOBILE_CAPTURE: 'MOBILE_CAPTURE',
  SIMULATOR: 'SIMULATOR',
  MOBILE_CLIENT: 'MOBILE_CLIENT',
  DESKTOP_CLIENT: 'DESKTOP_CLIENT',
  MANUAL_ENTRY: 'MANUAL_ENTRY',
  CONTROLLED_TEST_DATA: 'CONTROLLED_TEST_DATA'
} as const;

export type SourceType = (typeof SourceTypes)[keyof typeof SourceTypes];

export type Severity = 'LOW' | 'MEDIUM' | 'HIGH';

export type ActivityEvent = {
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

export type ActivityEventDto = {
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

export type RegisterActivityEventResponseDto = {
  eventId: string;
  riskScore: number | null;
  severity: Severity | null;
  alertGenerated: boolean;
  alertId: string | null;
};

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const approvedEventTypes = Object.values(EventTypes);
const approvedSourceTypes = Object.values(SourceTypes);

export function createActivityEvent(record: ActivityEvent): ActivityEvent {
  assertUuid(record.id, 'id');
  assertUuid(record.eventId, 'eventId');
  assertUuid(record.cattleId, 'cattleId');
  assertNonEmptyString(record.deviceId, 'deviceId');
  assertEventType(record.eventType);
  assertSourceType(record.source);
  assertConfidence(record.confidence);
  assertIsoDateTime(record.capturedAt, 'capturedAt');
  assertIsoDateTime(record.createdAt, 'createdAt');
  assertInactiveMinutes(record.eventType, record.inactiveMinutes);

  return {
    ...record,
    deviceId: record.deviceId.trim()
  };
}

export function toActivityEventDto(event: ActivityEvent): ActivityEventDto {
  return { ...event };
}

export function toRegisterActivityEventResponse(
  event: ActivityEvent,
  alertResult?: Pick<RegisterActivityEventResponseDto, 'riskScore' | 'severity' | 'alertGenerated' | 'alertId'>
): RegisterActivityEventResponseDto {
  return {
    eventId: event.eventId,
    riskScore: alertResult?.riskScore ?? null,
    severity: alertResult?.severity ?? null,
    alertGenerated: alertResult?.alertGenerated ?? false,
    alertId: alertResult?.alertId ?? null
  };
}

export function isUuid(value: string): boolean {
  return uuidPattern.test(value);
}

export function assertUuid(value: string, field: string): void {
  if (!isUuid(value)) {
    throw new Error(`${field} must be a valid UUID.`);
  }
}

export function assertEventType(value: string): asserts value is EventType {
  if (!approvedEventTypes.includes(value as EventType)) {
    throw new Error('eventType must be ACTIVITY or INACTIVITY.');
  }
}

export function assertSourceType(value: string): asserts value is SourceType {
  if (!approvedSourceTypes.includes(value as SourceType)) {
    throw new Error('source must be an approved activity-event source.');
  }
}

export function assertIsoDateTime(value: string, field: string): void {
  if (typeof value !== 'string' || Number.isNaN(Date.parse(value))) {
    throw new Error(`${field} must be a valid datetime.`);
  }
}

function assertConfidence(value: number): void {
  if (typeof value !== 'number' || Number.isNaN(value) || value < 0 || value > 1) {
    throw new Error('confidence must be a number between 0 and 1.');
  }
}

function assertInactiveMinutes(eventType: EventType, value: number | undefined | null): void {
  if (eventType === EventTypes.INACTIVITY && (!Number.isInteger(value) || (value as number) < 1)) {
    throw new Error('inactiveMinutes must be a positive integer for inactivity events.');
  }

  if (value !== undefined && value !== null && (!Number.isInteger(value) || value < 1)) {
    throw new Error('inactiveMinutes must be a positive integer when provided.');
  }
}

function assertNonEmptyString(value: string, field: string): void {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new Error(`${field} must not be empty.`);
  }
}
