import { assertUuid } from '../../activity-events/domain/activity-event';
import { toAlertDetailDto } from '../domain/alert';
import { AlertNotFoundError, InvalidAlertInputError } from './alert.errors';
import type { AlertCattleLookup, AlertDetailResponseDto, AlertEventLookup, AlertRepository } from './alert.types';

export class GetAlertDetailUseCase {
  private readonly alerts: AlertRepository;
  private readonly cattle: AlertCattleLookup;
  private readonly events: AlertEventLookup;

  constructor(alerts: AlertRepository, cattle: AlertCattleLookup, events: AlertEventLookup) {
    this.alerts = alerts;
    this.cattle = cattle;
    this.events = events;
  }

  async execute(alertId: string): Promise<AlertDetailResponseDto> {
    try {
      assertUuid(alertId, 'alertId');
      const alert = await this.alerts.findById(alertId);
      if (!alert) {
        throw new AlertNotFoundError(alertId);
      }

      const [tagNumber, eventId] = await Promise.all([
        this.cattle.findTagNumber(alert.cattleId),
        alert.sourceEventId ? this.events.findEventId(alert.sourceEventId) : Promise.resolve(null)
      ]);

      return toAlertDetailDto(alert, eventId, tagNumber);
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
