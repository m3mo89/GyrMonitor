import { assertIsoDateTime, assertUuid } from '../../activity-events/domain/activity-event';

export const AlertSeverities = {
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH'
} as const;

export type AlertSeverity = (typeof AlertSeverities)[keyof typeof AlertSeverities];

export const AlertStatuses = {
  PENDING: 'PENDING',
  IN_PROGRESS: 'IN_PROGRESS',
  ATTENDED: 'ATTENDED'
} as const;

export type AlertStatus = (typeof AlertStatuses)[keyof typeof AlertStatuses];

export type Alert = {
  id: string;
  cattleId: string;
  sourceEventId: string | null;
  severity: AlertSeverity;
  riskScore: number;
  status: AlertStatus;
  reason: string;
  createdAt: string;
  attendedAt?: string;
};

export type AlertListItemDto = {
  id: string;
  cattleId: string;
  tagNumber?: string;
  severity: AlertSeverity;
  riskScore: number;
  status: AlertStatus;
  reason: string;
  createdAt: string;
};

export type AlertDetailDto = AlertListItemDto & {
  eventId: string | null;
  attendedAt: string | null;
};

const approvedSeverities = Object.values(AlertSeverities);
const approvedStatuses = Object.values(AlertStatuses);

export function createAlert(record: Alert): Alert {
  assertUuid(record.id, 'id');
  assertUuid(record.cattleId, 'cattleId');

  if (record.sourceEventId !== null) {
    assertUuid(record.sourceEventId, 'sourceEventId');
  }

  assertAlertSeverity(record.severity);
  assertAlertStatus(record.status);
  assertRiskScore(record.riskScore);
  assertNonEmptyString(record.reason, 'reason');
  assertIsoDateTime(record.createdAt, 'createdAt');

  if (record.status === AlertStatuses.ATTENDED && !record.attendedAt) {
    throw new Error('attendedAt is required when alert status is ATTENDED.');
  }

  if (record.attendedAt !== undefined) {
    assertIsoDateTime(record.attendedAt, 'attendedAt');
  }

  return {
    ...record,
    reason: record.reason.trim()
  };
}

export function toAlertListItemDto(alert: Alert, tagNumber?: string): AlertListItemDto {
  return {
    id: alert.id,
    cattleId: alert.cattleId,
    tagNumber,
    severity: alert.severity,
    riskScore: alert.riskScore,
    status: alert.status,
    reason: alert.reason,
    createdAt: alert.createdAt
  };
}

export function toAlertDetailDto(alert: Alert, eventId: string | null, tagNumber?: string): AlertDetailDto {
  return {
    ...toAlertListItemDto(alert, tagNumber),
    eventId,
    attendedAt: alert.attendedAt ?? null
  };
}

export function assertAlertSeverity(value: string): asserts value is AlertSeverity {
  if (!approvedSeverities.includes(value as AlertSeverity)) {
    throw new Error('severity must be LOW, MEDIUM, or HIGH.');
  }
}

export function assertAlertStatus(value: string): asserts value is AlertStatus {
  if (!approvedStatuses.includes(value as AlertStatus)) {
    throw new Error('status must be PENDING, IN_PROGRESS, or ATTENDED.');
  }
}

export function canTransitionAlertStatus(from: AlertStatus, to: AlertStatus): boolean {
  if (from === AlertStatuses.PENDING) {
    return to === AlertStatuses.IN_PROGRESS || to === AlertStatuses.ATTENDED;
  }

  if (from === AlertStatuses.IN_PROGRESS) {
    return to === AlertStatuses.ATTENDED;
  }

  return false;
}

function assertRiskScore(value: number): void {
  if (typeof value !== 'number' || Number.isNaN(value) || value < 0 || value > 100) {
    throw new Error('riskScore must be a number between 0 and 100.');
  }
}

function assertNonEmptyString(value: string, field: string): void {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new Error(`${field} must not be empty.`);
  }
}
