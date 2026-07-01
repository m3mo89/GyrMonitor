import { describe, expect, it } from 'vitest';

import { EventTypes, SourceTypes, type ActivityEvent } from '../../activity-events/domain/activity-event';
import { MvpRiskCalculator } from '../../inactivity-analysis/application/risk-calculator';
import { LocalAlertRepository } from '../infrastructure/local-alert.repository';
import { AlertStatuses, createAlert } from '../domain/alert';
import type { Alert } from '../domain/alert';
import { AlertNotFoundError, InvalidAlertInputError } from './alert.errors';
import { GenerateAlertFromActivityEventUseCase } from './generate-alert-from-activity-event.use-case';
import { GetAlertDetailUseCase } from './get-alert-detail.use-case';
import { ListAlertsUseCase } from './list-alerts.use-case';
import { UpdateAlertStatusUseCase } from './update-alert-status.use-case';

const cattleId = '11111111-1111-4111-8111-111111111111';
const sourceEventId = '22222222-2222-4222-8222-222222222222';
const eventId = '33333333-3333-4333-8333-333333333333';
const alertId = '44444444-4444-4444-8444-444444444444';

const inactivityEvent: ActivityEvent = {
  id: sourceEventId,
  eventId,
  deviceId: 'device-1',
  cattleId,
  eventType: EventTypes.INACTIVITY,
  inactiveMinutes: 90,
  confidence: 0.91,
  capturedAt: '2026-06-30T01:00:00.000Z',
  source: SourceTypes.DESKTOP_SIMULATOR,
  createdAt: '2026-06-30T01:00:01.000Z'
};

const alert: Alert = createAlert({
  id: alertId,
  cattleId,
  sourceEventId,
  severity: 'HIGH',
  riskScore: 90,
  status: 'PENDING',
  reason: 'Inactividad prolongada: 90 minutos.',
  createdAt: '2026-06-30T01:01:00.000Z'
});

const cattleLookup = {
  findTagNumber: async () => 'GYR-023'
};

const eventLookup = {
  findEventId: async () => eventId
};

describe('GenerateAlertFromActivityEventUseCase', () => {
  it('creates a pending alert for inactivity above threshold', async () => {
    const repository = new LocalAlertRepository();
    const useCase = new GenerateAlertFromActivityEventUseCase(repository, new MvpRiskCalculator(), () => alertId, () => alert.createdAt);

    await expect(useCase.evaluate(inactivityEvent)).resolves.toEqual({
      riskScore: 90,
      severity: 'HIGH',
      alertGenerated: true,
      alertId
    });
    await expect(repository.findBySourceEventId(sourceEventId)).resolves.toMatchObject({ id: alertId, status: AlertStatuses.PENDING, cattleId });
  });

  it('does not create alerts below threshold or for activity events', async () => {
    const useCase = new GenerateAlertFromActivityEventUseCase(new LocalAlertRepository(), new MvpRiskCalculator(), () => alertId, () => alert.createdAt);

    await expect(useCase.evaluate({ ...inactivityEvent, inactiveMinutes: 45 })).resolves.toEqual({
      riskScore: 45,
      severity: 'LOW',
      alertGenerated: false,
      alertId: null
    });
    await expect(useCase.evaluate({ ...inactivityEvent, eventType: EventTypes.ACTIVITY, inactiveMinutes: undefined })).resolves.toEqual({
      riskScore: null,
      severity: null,
      alertGenerated: false,
      alertId: null
    });
  });

  it('returns the existing source-event alert idempotently', async () => {
    const repository = new LocalAlertRepository([alert]);
    const useCase = new GenerateAlertFromActivityEventUseCase(repository, new MvpRiskCalculator(), () => '55555555-5555-4555-8555-555555555555');

    await expect(useCase.evaluate(inactivityEvent)).resolves.toMatchObject({ alertGenerated: true, alertId });
    await expect(repository.list({ page: 1, pageSize: 20 })).resolves.toMatchObject({ pagination: { total: 1 } });
  });
});

describe('Alert query and status use cases', () => {
  it('lists and filters alerts with cattle tag data', async () => {
    const useCase = new ListAlertsUseCase(new LocalAlertRepository([alert]), cattleLookup);

    await expect(useCase.execute({ status: 'PENDING', severity: 'HIGH', cattleId })).resolves.toEqual({
      data: [
        {
          id: alertId,
          cattleId,
          tagNumber: 'GYR-023',
          severity: 'HIGH',
          riskScore: 90,
          status: 'PENDING',
          reason: 'Inactividad prolongada: 90 minutos.',
          createdAt: '2026-06-30T01:01:00.000Z'
        }
      ],
      pagination: { page: 1, pageSize: 20, total: 1 }
    });
  });

  it('returns alert detail with source event traceability', async () => {
    const useCase = new GetAlertDetailUseCase(new LocalAlertRepository([alert]), cattleLookup, eventLookup);

    await expect(useCase.execute(alertId)).resolves.toMatchObject({
      id: alertId,
      cattleId,
      eventId,
      tagNumber: 'GYR-023'
    });
  });

  it('updates valid lifecycle transitions and requires attendedAt', async () => {
    const repository = new LocalAlertRepository([alert]);
    const useCase = new UpdateAlertStatusUseCase(repository);

    await expect(useCase.execute({ alertId, status: 'IN_PROGRESS' })).resolves.toEqual({
      id: alertId,
      status: 'IN_PROGRESS',
      attendedAt: null
    });
    await expect(useCase.execute({ alertId, status: 'ATTENDED', attendedAt: '2026-06-30T02:00:00.000Z' })).resolves.toEqual({
      id: alertId,
      status: 'ATTENDED',
      attendedAt: '2026-06-30T02:00:00.000Z'
    });
  });

  it('rejects invalid filters, missing alerts, and invalid transitions', async () => {
    const repository = new LocalAlertRepository([alert]);

    await expect(new ListAlertsUseCase(repository, cattleLookup).execute({ status: 'UNKNOWN' })).rejects.toBeInstanceOf(InvalidAlertInputError);
    await expect(new GetAlertDetailUseCase(repository, cattleLookup, eventLookup).execute('55555555-5555-4555-8555-555555555555')).rejects.toBeInstanceOf(AlertNotFoundError);
    await expect(new UpdateAlertStatusUseCase(repository).execute({ alertId, status: 'ATTENDED' })).rejects.toBeInstanceOf(InvalidAlertInputError);
    await expect(
      new UpdateAlertStatusUseCase(new LocalAlertRepository([{ ...alert, status: 'ATTENDED', attendedAt: '2026-06-30T02:00:00.000Z' }])).execute({
        alertId,
        status: 'IN_PROGRESS'
      })
    ).rejects.toBeInstanceOf(InvalidAlertInputError);
  });
});
