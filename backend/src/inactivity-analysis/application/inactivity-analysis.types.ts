import type { ActivityEvent } from '../../activity-events/domain/activity-event';
import type { AlertSeverity } from '../domain/severity';

export type RiskEvaluation = {
  riskScore: number;
  severity: AlertSeverity;
  exceedsAlertThreshold: boolean;
};

export type ActivityEventRiskEvaluator = {
  evaluate(event: ActivityEvent): RiskEvaluation | null;
};
