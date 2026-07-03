import { DomainError } from '../../shared/domain/domain-error';

export class InvalidAlertInputError extends DomainError {
  constructor(message: string) {
    super(message, 400, 'VALIDATION_ERROR');
  }
}

export class AlertNotFoundError extends DomainError {
  constructor(alertId: string) {
    super(`Alert not found: ${alertId}`, 404, 'NOT_FOUND');
  }
}
