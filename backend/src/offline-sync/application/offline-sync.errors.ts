export class InvalidSyncInputError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidSyncInputError';
  }
}

export class IdempotencyConflictError extends Error {
  constructor() {
    super('Idempotency-Key was already used with a different payload.');
    this.name = 'IdempotencyConflictError';
  }
}
