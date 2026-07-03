import { DomainError } from '../../shared/domain/domain-error';

export class InvalidSyncInputError extends DomainError {
  constructor(message: string) {
    super(message, 400, 'VALIDATION_ERROR');
  }
}

export class IdempotencyConflictError extends DomainError {
  constructor() {
    super('Idempotency-Key was already used with a different payload.', 409, 'IDEMPOTENCY_CONFLICT');
  }
}
