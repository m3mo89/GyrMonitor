import { describe, expect, it } from 'vitest';

import { EventTypes, SourceTypes, type ActivityEvent } from '../../activity-events/domain/activity-event';
import { classifySeverity, MvpRiskCalculator } from './risk-calculator';

const cattleId = '11111111-1111-4111-8111-111111111111';
const sourceEventId = '22222222-2222-4222-8222-222222222222';
const eventId = '33333333-3333-4333-8333-333333333333';

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

describe('MvpRiskCalculator', () => {
  it('evaluates inactivity deterministically and classifies severity', () => {
    const calculator = new MvpRiskCalculator();

    expect(calculator.evaluate({ ...inactivityEvent, inactiveMinutes: 45 })).toEqual({
      riskScore: 45,
      severity: 'LOW',
      exceedsAlertThreshold: false
    });
    expect(calculator.evaluate({ ...inactivityEvent, inactiveMinutes: 60 })).toMatchObject({ riskScore: 60, severity: 'MEDIUM', exceedsAlertThreshold: true });
    expect(calculator.evaluate(inactivityEvent)).toMatchObject({ riskScore: 90, severity: 'HIGH', exceedsAlertThreshold: true });
    expect(classifySeverity(100)).toBe('HIGH');
  });

  it('does not evaluate activity events for alert generation', () => {
    expect(new MvpRiskCalculator().evaluate({ ...inactivityEvent, eventType: EventTypes.ACTIVITY, inactiveMinutes: undefined })).toBeNull();
  });
});
