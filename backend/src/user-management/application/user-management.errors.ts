import { DomainError } from '../../shared/domain/domain-error';

export class InvalidUserInputError extends DomainError {
  constructor(message: string) {
    super(message, 400, 'VALIDATION_ERROR');
  }
}

export class EmailAlreadyExistsError extends DomainError {
  constructor(email: string) {
    super(`A user with email ${email} already exists.`, 400, 'VALIDATION_ERROR');
  }
}

export class UserNotFoundError extends DomainError {
  constructor(userId: string) {
    super(`User not found: ${userId}`, 404, 'NOT_FOUND');
  }
}

export class SelfDisableNotAllowedError extends DomainError {
  constructor() {
    super('An admin cannot disable their own account.', 400, 'VALIDATION_ERROR');
  }
}
