import { EventTypes, type ActivityEvent } from '../../activity-events/domain/activity-event';
import { AlertSeverities, type AlertSeverity } from '../domain/severity';
import type { ActivityEventRiskEvaluator, RiskEvaluation } from './inactivity-analysis.types';

export const mvpRiskPolicy = {
  alertThreshold: 60,
  highSeverityThreshold: 80,
  mediumSeverityThreshold: 60
} as const;

export class MvpRiskCalculator implements ActivityEventRiskEvaluator {
  evaluate(event: ActivityEvent): RiskEvaluation | null {
    if (event.eventType !== EventTypes.INACTIVITY) {
      return null;
    }

    const inactiveMinutes = event.inactiveMinutes ?? 0;
    const riskScore = Math.min(100, inactiveMinutes);

    return {
      riskScore,
      severity: classifySeverity(riskScore),
      exceedsAlertThreshold: riskScore >= mvpRiskPolicy.alertThreshold
    };
  }
}

export function classifySeverity(riskScore: number): AlertSeverity {
  if (riskScore >= mvpRiskPolicy.highSeverityThreshold) {
    return AlertSeverities.HIGH;
  }

  if (riskScore >= mvpRiskPolicy.mediumSeverityThreshold) {
    return AlertSeverities.MEDIUM;
  }

  return AlertSeverities.LOW;
}
