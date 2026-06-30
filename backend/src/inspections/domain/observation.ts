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

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

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

export function isUuid(value: string): boolean {
  return uuidPattern.test(value);
}

export function assertUuid(value: string, field: string): void {
  if (!isUuid(value)) {
    throw new Error(`${field} must be a valid UUID.`);
  }
}

export function assertNonEmptyComment(comment: string): void {
  if (typeof comment !== 'string' || comment.trim().length === 0) {
    throw new Error('comment must not be empty.');
  }
}

export function assertIsoDateTime(value: string, field: string): void {
  if (typeof value !== 'string' || Number.isNaN(Date.parse(value))) {
    throw new Error(`${field} must be a valid datetime.`);
  }
}

function normalizeOptionalString(value: string | undefined): string | undefined {
  if (typeof value !== 'string') {
    return undefined;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}
