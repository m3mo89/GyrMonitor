import { describe, expect, it } from 'vitest';

import { EventTypes, SourceTypes, type ActivityEvent } from '../../activity-events/domain/activity-event';
import { CattleSex, CattleStatus, type Cattle } from '../../cattle-monitoring/domain/cattle';
import { InvalidDashboardQueryError } from './dashboard.errors';
import { GetDashboardMetricsUseCase } from './get-dashboard-metrics.use-case';
import { LocalDashboardDataSource } from '../infrastructure/local-dashboard-data-source';

const cattle: Cattle[] = [
  {
    id: '11111111-1111-4111-8111-111111111111',
    tagNumber: 'GYR-001',
    breed: 'Gyr',
    sex: CattleSex.FEMALE,
    status: CattleStatus.ACTIVE,
    createdAt: '2026-06-30T00:00:00.000Z',
    lastRiskScore: 90
  },
  {
    id: '22222222-2222-4222-8222-222222222222',
    tagNumber: 'GYR-002',
    breed: 'Gyr',
    sex: CattleSex.FEMALE,
    status: CattleStatus.ACTIVE,
    createdAt: '2026-06-30T00:00:00.000Z',
    lastRiskScore: 30
  }
];

const events: ActivityEvent[] = [
  {
    id: '33333333-3333-4333-8333-333333333333',
    eventId: '44444444-4444-4444-8444-444444444444',
    deviceId: 'SIM-001',
    cattleId: cattle[0].id,
    eventType: EventTypes.INACTIVITY,
    inactiveMinutes: 90,
    confidence: 0.9,
    capturedAt: '2026-06-30T10:00:00.000Z',
    source: SourceTypes.DESKTOP_SIMULATOR,
    createdAt: '2026-06-30T10:00:01.000Z'
  },
  {
    id: '55555555-5555-4555-8555-555555555555',
    eventId: '66666666-6666-4666-8666-666666666666',
    deviceId: 'SIM-001',
    cattleId: cattle[1].id,
    eventType: EventTypes.ACTIVITY,
    confidence: 0.8,
    capturedAt: '2026-06-29T10:00:00.000Z',
    source: SourceTypes.DESKTOP_SIMULATOR,
    createdAt: '2026-06-29T10:00:01.000Z'
  }
];

describe('GetDashboardMetricsUseCase', () => {
  it('returns backend-calculated dashboard aggregates, ranking and trend', async () => {
    const useCase = new GetDashboardMetricsUseCase(
      new LocalDashboardDataSource({
        cattle,
        events,
        alerts: [
          { cattleId: cattle[0].id, status: 'PENDING', riskScore: 90, createdAt: '2026-06-30T10:10:00.000Z' },
          { cattleId: cattle[1].id, status: 'ATTENDED', riskScore: 30, createdAt: '2026-06-29T10:10:00.000Z' }
        ],
        now: () => new Date('2026-06-30T12:00:00.000Z')
      })
    );

    await expect(
      useCase.execute({
        from: '2026-06-29T00:00:00.000Z',
        to: '2026-06-30T23:59:59.000Z'
      })
    ).resolves.toEqual({
      totalCattle: 2,
      activeAlerts: 1,
      averageRiskScore: 60,
      highRiskCattle: 1,
      eventsToday: 1,
      syncPendingCount: 0,
      riskRanking: [
        { cattleId: cattle[0].id, tagNumber: 'GYR-001', riskScore: 90 },
        { cattleId: cattle[1].id, tagNumber: 'GYR-002', riskScore: 30 }
      ],
      trend: [
        { date: '2026-06-29', events: 1, alerts: 1 },
        { date: '2026-06-30', events: 1, alerts: 1 }
      ]
    });
  });

  it('returns zeroed values for empty source data', async () => {
    const useCase = new GetDashboardMetricsUseCase(new LocalDashboardDataSource({ now: () => new Date('2026-06-30T12:00:00.000Z') }));

    await expect(useCase.execute()).resolves.toEqual({
      totalCattle: 0,
      activeAlerts: 0,
      averageRiskScore: 0,
      highRiskCattle: 0,
      eventsToday: 0,
      syncPendingCount: 0,
      riskRanking: [],
      trend: []
    });
  });

  it('rejects invalid date range and corral filters', async () => {
    const useCase = new GetDashboardMetricsUseCase(new LocalDashboardDataSource());

    await expect(useCase.execute({ from: 'bad-date' })).rejects.toBeInstanceOf(InvalidDashboardQueryError);
    await expect(
      useCase.execute({ from: '2026-07-01T00:00:00.000Z', to: '2026-06-30T00:00:00.000Z' })
    ).rejects.toBeInstanceOf(InvalidDashboardQueryError);
    await expect(useCase.execute({ corralId: 'bad-id' })).rejects.toBeInstanceOf(InvalidDashboardQueryError);
  });
});
