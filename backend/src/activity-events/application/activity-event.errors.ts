import { DomainError } from '../../shared/domain/domain-error';

export class InvalidActivityEventInputError extends DomainError {
  constructor(message: string) {
    super(message, 400, 'VALIDATION_ERROR');
  }
}

export class ActivityEventCattleNotFoundError extends DomainError {
  constructor() {
    super('Cattle record was not found.', 404, 'NOT_FOUND');
  }
}
