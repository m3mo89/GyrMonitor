import { assertIsoDateTime, assertUuid } from '../../activity-events/domain/activity-event';
import { AlertStatuses, assertAlertStatus, canTransitionAlertStatus } from '../domain/alert';
import { AlertNotFoundError, InvalidAlertInputError } from './alert.errors';
import type { AlertRepository, UpdateAlertStatusCommand, UpdateAlertStatusResponseDto } from './alert.types';

export class UpdateAlertStatusUseCase {
  private readonly alerts: AlertRepository;

  constructor(alerts: AlertRepository) {
    this.alerts = alerts;
  }

  async execute(command: UpdateAlertStatusCommand): Promise<UpdateAlertStatusResponseDto> {
    try {
      assertUuid(command.alertId, 'alertId');
      assertAlertStatus(command.status);

      if (command.status === AlertStatuses.ATTENDED && !command.attendedAt) {
        throw new Error('attendedAt is required when status is ATTENDED.');
      }

      if (command.attendedAt) {
        assertIsoDateTime(command.attendedAt, 'attendedAt');
      }

      const alert = await this.alerts.findById(command.alertId);
      if (!alert) {
        throw new AlertNotFoundError(command.alertId);
      }

      if (!canTransitionAlertStatus(alert.status, command.status)) {
        throw new Error(`Cannot transition alert from ${alert.status} to ${command.status}.`);
      }

      const updated = await this.alerts.updateStatus(command.alertId, command.status, command.attendedAt);
      if (!updated) {
        throw new AlertNotFoundError(command.alertId);
      }

      return {
        id: updated.id,
        status: updated.status,
        attendedAt: updated.attendedAt ?? null
      };
    } catch (error) {
      if (error instanceof AlertNotFoundError) {
        throw error;
      }

      if (error instanceof Error) {
        throw new InvalidAlertInputError(error.message);
      }

      throw error;
    }
  }
}
