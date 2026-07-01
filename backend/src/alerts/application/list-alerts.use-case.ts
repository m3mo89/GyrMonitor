import { assertUuid } from '../../activity-events/domain/activity-event';
import { assertAlertSeverity, assertAlertStatus, toAlertListItemDto } from '../domain/alert';
import type { AlertStatus } from '../domain/alert';
import type { AlertSeverity } from '../../inactivity-analysis/domain/severity';
import { InvalidAlertInputError } from './alert.errors';
import type { AlertCattleLookup, AlertListResponseDto, AlertRepository, ListAlertsQuery, NormalizedListAlertsQuery } from './alert.types';

export class ListAlertsUseCase {
  private readonly alerts: AlertRepository;
  private readonly cattle: AlertCattleLookup;

  constructor(alerts: AlertRepository, cattle: AlertCattleLookup) {
    this.alerts = alerts;
    this.cattle = cattle;
  }

  async execute(query: ListAlertsQuery = {}): Promise<AlertListResponseDto> {
    try {
      const normalized = normalizeQuery(query);
      const result = await this.alerts.list(normalized);
      const data = await Promise.all(
        result.data.map(async (alert) => toAlertListItemDto(alert, await this.cattle.findTagNumber(alert.cattleId)))
      );

      return {
        data,
        pagination: result.pagination
      };
    } catch (error) {
      if (error instanceof Error) {
        throw new InvalidAlertInputError(error.message);
      }

      throw error;
    }
  }
}

function normalizeQuery(query: ListAlertsQuery): NormalizedListAlertsQuery {
  let status: AlertStatus | undefined;
  let severity: AlertSeverity | undefined;

  if (query.status) {
    assertAlertStatus(query.status);
    status = query.status;
  }

  if (query.severity) {
    assertAlertSeverity(query.severity);
    severity = query.severity;
  }

  if (query.cattleId) {
    assertUuid(query.cattleId, 'cattleId');
  }

  return {
    status,
    severity,
    cattleId: query.cattleId,
    page: normalizePositiveInteger(query.page, 1),
    pageSize: Math.min(normalizePositiveInteger(query.pageSize, 20), 100)
  };
}

function normalizePositiveInteger(value: number | undefined, fallback: number): number {
  if (!Number.isInteger(value) || (value as number) < 1) {
    return fallback;
  }

  return value as number;
}
