import { toDatabaseDateTime } from '../../database/date-mapping';
import { getSharedDatabaseClient } from '../../database/database-singleton';
import type { DatabaseClient } from '../../database/database.types';
import type {
  DashboardDataSource,
  DashboardMetricsResponseDto,
  DashboardRiskRankingItemDto,
  DashboardTrendItemDto,
  NormalizedDashboardQuery
} from '../application/dashboard.types';

type CountRow = {
  total: number | string | null;
};

type AverageRow = {
  averageRiskScore: number | string | null;
};

type RankingRow = {
  cattleId: string;
  tagNumber: string;
  riskScore: number | string;
};

type TrendRow = {
  date: string | Date;
  events?: number | string | null;
  alerts?: number | string | null;
};

export class MariaDbDashboardDataSource implements DashboardDataSource {
  private readonly client: DatabaseClient;

  constructor(client: DatabaseClient = getSharedDatabaseClient()) {
    this.client = client;
  }

  async getMetrics(query: NormalizedDashboardQuery): Promise<DashboardMetricsResponseDto> {
    const [totalCattle, activeAlerts, averageRiskScore, highRiskCattle, eventsToday, riskRanking, trend] = await Promise.all([
      this.count('SELECT COUNT(*) AS total FROM cattle'),
      this.count("SELECT COUNT(*) AS total FROM alerts WHERE status IN ('PENDING', 'IN_PROGRESS')"),
      this.averageRiskScore(),
      this.count('SELECT COUNT(*) AS total FROM cattle WHERE last_risk_score >= 80'),
      this.eventsToday(),
      this.riskRanking(),
      this.trend(query)
    ]);

    return {
      totalCattle,
      activeAlerts,
      averageRiskScore,
      highRiskCattle,
      eventsToday,
      syncPendingCount: 0,
      riskRanking,
      trend
    };
  }

  private async count(sql: string, params: unknown[] = []): Promise<number> {
    const [row] = await this.client.query<CountRow>(sql, params);
    return Number(row?.total ?? 0);
  }

  private async averageRiskScore(): Promise<number> {
    const [row] = await this.client.query<AverageRow>('SELECT AVG(last_risk_score) AS averageRiskScore FROM cattle WHERE last_risk_score IS NOT NULL');
    return roundOne(Number(row?.averageRiskScore ?? 0));
  }

  private async eventsToday(): Promise<number> {
    const now = new Date();
    const from = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0, 0));
    const to = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1, 0, 0, 0, 0));

    return this.count('SELECT COUNT(*) AS total FROM activity_events WHERE captured_at >= ? AND captured_at < ?', [
      toDatabaseDateTime(from.toISOString()),
      toDatabaseDateTime(to.toISOString())
    ]);
  }

  private async riskRanking(): Promise<DashboardRiskRankingItemDto[]> {
    const rows = await this.client.query<RankingRow>(
      `SELECT id AS cattleId, tag_number AS tagNumber, last_risk_score AS riskScore
       FROM cattle
       WHERE last_risk_score IS NOT NULL
       ORDER BY last_risk_score DESC, tag_number ASC
       LIMIT 10`
    );

    return rows.map((row) => ({
      cattleId: row.cattleId,
      tagNumber: row.tagNumber,
      riskScore: Number(row.riskScore)
    }));
  }

  private async trend(query: NormalizedDashboardQuery): Promise<DashboardTrendItemDto[]> {
    const { where, params } = periodWhere('captured_at', query);
    const eventRows = await this.client.query<TrendRow>(
      `SELECT DATE(captured_at) AS date, COUNT(*) AS events
       FROM activity_events
       ${where}
       GROUP BY DATE(captured_at)
       ORDER BY DATE(captured_at) ASC`,
      params
    );
    const alertPeriod = periodWhere('created_at', query);
    const alertRows = await this.client.query<TrendRow>(
      `SELECT DATE(created_at) AS date, COUNT(*) AS alerts
       FROM alerts
       ${alertPeriod.where}
       GROUP BY DATE(created_at)
       ORDER BY DATE(created_at) ASC`,
      alertPeriod.params
    );
    const trendByDate = new Map<string, DashboardTrendItemDto>();

    for (const row of eventRows) {
      const date = toDateKey(row.date);
      trendByDate.set(date, { date, events: Number(row.events ?? 0), alerts: 0 });
    }

    for (const row of alertRows) {
      const date = toDateKey(row.date);
      const entry = trendByDate.get(date) ?? { date, events: 0, alerts: 0 };
      entry.alerts = Number(row.alerts ?? 0);
      trendByDate.set(date, entry);
    }

    return [...trendByDate.values()].sort((left, right) => left.date.localeCompare(right.date));
  }
}

function periodWhere(column: string, query: NormalizedDashboardQuery): { where: string; params: unknown[] } {
  const filters: string[] = [];
  const params: unknown[] = [];

  if (query.from) {
    filters.push(`${column} >= ?`);
    params.push(toDatabaseDateTime(query.from));
  }

  if (query.to) {
    filters.push(`${column} <= ?`);
    params.push(toDatabaseDateTime(query.to));
  }

  return {
    where: filters.length > 0 ? `WHERE ${filters.join(' AND ')}` : '',
    params
  };
}

function toDateKey(value: string | Date): string {
  if (value instanceof Date) {
    return value.toISOString().slice(0, 10);
  }

  return String(value).slice(0, 10);
}

function roundOne(value: number): number {
  return Math.round(value * 10) / 10;
}
