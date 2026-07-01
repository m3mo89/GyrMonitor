import type { ActivityEvent } from '../../activity-events/domain/activity-event';
import { createAlert } from '../domain/alert';
import type { ActivityAlertEvaluator, AlertGenerationResult, AlertRepository } from './alert.types';
import { MvpRiskCalculator } from './risk-calculator';

export class GenerateAlertFromActivityEventUseCase implements ActivityAlertEvaluator {
  private readonly alerts: AlertRepository;
  private readonly riskCalculator: MvpRiskCalculator;
  private readonly generateId: () => string;
  private readonly now: () => string;

  constructor(
    alerts: AlertRepository,
    riskCalculator: MvpRiskCalculator = new MvpRiskCalculator(),
    generateId: () => string = generateUuid,
    now: () => string = () => new Date().toISOString()
  ) {
    this.alerts = alerts;
    this.riskCalculator = riskCalculator;
    this.generateId = generateId;
    this.now = now;
  }

  async evaluate(event: ActivityEvent): Promise<AlertGenerationResult> {
    const evaluation = this.riskCalculator.evaluate(event);
    if (!evaluation) {
      return noAlert();
    }

    const existing = await this.alerts.findBySourceEventId(event.id);
    if (existing) {
      return {
        riskScore: existing.riskScore,
        severity: existing.severity,
        alertGenerated: true,
        alertId: existing.id
      };
    }

    if (!evaluation.exceedsAlertThreshold) {
      return {
        riskScore: evaluation.riskScore,
        severity: evaluation.severity,
        alertGenerated: false,
        alertId: null
      };
    }

    const alert = await this.alerts.save(
      createAlert({
        id: this.generateId(),
        cattleId: event.cattleId,
        sourceEventId: event.id,
        severity: evaluation.severity,
        riskScore: evaluation.riskScore,
        status: 'PENDING',
        reason: `Inactividad prolongada: ${event.inactiveMinutes ?? 0} minutos.`,
        createdAt: this.now()
      })
    );

    return {
      riskScore: alert.riskScore,
      severity: alert.severity,
      alertGenerated: true,
      alertId: alert.id
    };
  }
}

function noAlert(): AlertGenerationResult {
  return {
    riskScore: null,
    severity: null,
    alertGenerated: false,
    alertId: null
  };
}

function generateUuid(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (token) => {
    const random = Math.floor(Math.random() * 16);
    const value = token === 'x' ? random : (random & 0x3) | 0x8;
    return value.toString(16);
  });
}
