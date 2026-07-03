import { DomainError } from '../../shared/domain/domain-error';

export class InvalidDashboardQueryError extends DomainError {
  constructor(message = 'Invalid dashboard query.') {
    super(message, 400, 'VALIDATION_ERROR');
  }
}
