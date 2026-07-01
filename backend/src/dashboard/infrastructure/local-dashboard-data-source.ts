import type { AlertStatus } from '../../alerts/domain/alert';
import type { ActivityEvent } from '../../activity-events/domain/activity-event';
import type { Cattle } from '../../cattle-monitoring/domain/cattle';
import type { DashboardDataSource, DashboardMetricsResponseDto, NormalizedDashboardQuery } from '../application/dashboard.types';

type LocalAlert = {
  cattleId: string;
  status: AlertStatus;
  riskScore: number;
  createdAt: string;
};

export class LocalDashboardDataSource implements DashboardDataSource {
  private readonly cattle: Cattle[];
  private readonly alerts: LocalAlert[];
  private readonly events: ActivityEvent[];
  private readonly now: () => Date;

  constructor(input: { cattle?: Cattle[]; alerts?: LocalAlert[]; events?: ActivityEvent[]; now?: () => Date } = {}) {
    this.cattle = input.cattle ?? [];
    this.alerts = input.alerts ?? [];
    this.events = input.events ?? [];
    this.now = input.now ?? (() => new Date());
  }

  async getMetrics(query: NormalizedDashboardQuery): Promise<DashboardMetricsResponseDto> {
    const periodEvents = this.events.filter((event) => isWithinPeriod(event.capturedAt, query));
    const periodAlerts = this.alerts.filter((alert) => isWithinPeriod(alert.createdAt, query));
    const riskValues = this.cattle.map((record) => record.lastRiskScore).filter((score): score is number => typeof score === 'number');
    const activeAlerts = this.alerts.filter((alert) => alert.status === 'PENDING' || alert.status === 'IN_PROGRESS');
    const today = toDateKey(this.now().toISOString());

    return {
      totalCattle: this.cattle.length,
      activeAlerts: activeAlerts.length,
      averageRiskScore: roundOne(riskValues.length === 0 ? 0 : riskValues.reduce((total, score) => total + score, 0) / riskValues.length),
      highRiskCattle: this.cattle.filter((record) => (record.lastRiskScore ?? 0) >= 80).length,
      eventsToday: this.events.filter((event) => toDateKey(event.capturedAt) === today).length,
      syncPendingCount: 0,
      riskRanking: this.cattle
        .filter((record) => typeof record.lastRiskScore === 'number')
        .sort((left, right) => (right.lastRiskScore ?? 0) - (left.lastRiskScore ?? 0) || left.tagNumber.localeCompare(right.tagNumber))
        .slice(0, 10)
        .map((record) => ({
          cattleId: record.id,
          tagNumber: record.tagNumber,
          riskScore: record.lastRiskScore ?? 0
        })),
      trend: buildTrend(periodEvents, periodAlerts)
    };
  }
}

function isWithinPeriod(value: string, query: NormalizedDashboardQuery): boolean {
  const time = Date.parse(value);
  return (!query.from || time >= Date.parse(query.from)) && (!query.to || time <= Date.parse(query.to));
}

function buildTrend(events: ActivityEvent[], alerts: LocalAlert[]) {
  const days = new Map<string, { date: string; events: number; alerts: number }>();

  for (const event of events) {
    const date = toDateKey(event.capturedAt);
    const entry = days.get(date) ?? { date, events: 0, alerts: 0 };
    entry.events += 1;
    days.set(date, entry);
  }

  for (const alert of alerts) {
    const date = toDateKey(alert.createdAt);
    const entry = days.get(date) ?? { date, events: 0, alerts: 0 };
    entry.alerts += 1;
    days.set(date, entry);
  }

  return [...days.values()].sort((left, right) => left.date.localeCompare(right.date));
}

function toDateKey(value: string): string {
  return value.slice(0, 10);
}

function roundOne(value: number): number {
  return Math.round(value * 10) / 10;
}
