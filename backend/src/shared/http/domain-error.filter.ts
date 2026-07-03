import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';
import type { Response } from 'express';

import { DomainError } from '../domain/domain-error';
import { apiError } from './api-response';

/**
 * Domain error -> HTTP mapping (status/code declared by each error's own constructor,
 * listed here for traceability with the pre-refactor per-controller toHttpError() functions):
 *
 *   CattleNotFoundError                (cattle-monitoring) -> 404 NOT_FOUND
 *   InvalidCattleIdError               (cattle-monitoring) -> 400 VALIDATION_ERROR
 *   InvalidAlertInputError             (alerts)            -> 400 VALIDATION_ERROR
 *   AlertNotFoundError                 (alerts)            -> 404 NOT_FOUND
 *   AlertNotFoundError                 (inspections)       -> 404 NOT_FOUND
 *   InvalidObservationInputError       (inspections)       -> 400 VALIDATION_ERROR
 *   InvalidDashboardQueryError         (dashboard)          -> 400 VALIDATION_ERROR
 *   InvalidActivityEventInputError     (activity-events)   -> 400 VALIDATION_ERROR
 *   ActivityEventCattleNotFoundError   (activity-events)   -> 404 NOT_FOUND
 *   InvalidSyncInputError              (offline-sync)      -> 400 VALIDATION_ERROR
 *   IdempotencyConflictError           (offline-sync)       -> 409 IDEMPOTENCY_CONFLICT
 *
 * Anything else thrown as a NestJS HttpException (guards, authentication controller) passes
 * through unchanged. Any other unexpected error becomes a generic 500 INTERNAL_ERROR.
 */
@Catch()
export class DomainErrorFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const response = host.switchToHttp().getResponse<Response>();

    if (exception instanceof DomainError) {
      response.status(exception.httpStatus).json(apiError(exception.code, exception.message));
      return;
    }

    if (exception instanceof HttpException) {
      response.status(exception.getStatus()).json(exception.getResponse());
      return;
    }

    response.status(HttpStatus.INTERNAL_SERVER_ERROR).json(apiError('INTERNAL_ERROR', 'Unexpected error.'));
  }
}
