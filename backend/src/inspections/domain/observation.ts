import { assertIsoDateTime, assertUuid } from '../../shared/validation/assertions';

export type Observation = {
  id: string;
  observationId: string;
  alertId: string;
  userId: string;
  comment: string;
  createdAt: string;
  clientId?: string;
};

export type ObservationDto = {
  id: string;
  alertId: string;
  userId: string;
  comment: string;
  createdAt: string;
};

export function createObservation(record: Observation): Observation {
  assertUuid(record.id, 'id');
  assertUuid(record.observationId, 'observationId');
  assertUuid(record.alertId, 'alertId');
  assertUuid(record.userId, 'userId');
  assertNonEmptyComment(record.comment);
  assertIsoDateTime(record.createdAt, 'createdAt');

  return {
    ...record,
    comment: record.comment.trim(),
    clientId: normalizeOptionalString(record.clientId)
  };
}

export function toObservationDto(observation: Observation): ObservationDto {
  return {
    id: observation.id,
    alertId: observation.alertId,
    userId: observation.userId,
    comment: observation.comment,
    createdAt: observation.createdAt
  };
}

export function assertNonEmptyComment(comment: string): void {
  if (typeof comment !== 'string' || comment.trim().length === 0) {
    throw new Error('comment must not be empty.');
  }
}

function normalizeOptionalString(value: string | undefined): string | undefined {
  if (typeof value !== 'string') {
    return undefined;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}
