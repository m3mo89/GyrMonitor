import { DomainError } from '../../shared/domain/domain-error';

export class CattleNotFoundError extends DomainError {
  constructor() {
    super('Cattle record was not found.', 404, 'NOT_FOUND');
  }
}

export class InvalidCattleIdError extends DomainError {
  constructor() {
    super('Cattle id must be a valid UUID.', 400, 'VALIDATION_ERROR');
  }
}
