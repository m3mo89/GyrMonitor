import { assertIsoDateTime, assertUuid } from '../../activity-events/domain/activity-event';
import { InvalidDashboardQueryError } from './dashboard.errors';
import type { DashboardDataSource, DashboardMetricsResponseDto, DashboardQuery, NormalizedDashboardQuery } from './dashboard.types';

export class GetDashboardMetricsUseCase {
  private readonly dataSource: DashboardDataSource;

  constructor(dataSource: DashboardDataSource) {
    this.dataSource = dataSource;
  }

  async execute(query: DashboardQuery = {}): Promise<DashboardMetricsResponseDto> {
    try {
      return await this.dataSource.getMetrics(normalizeQuery(query));
    } catch (error) {
      if (error instanceof InvalidDashboardQueryError) {
        throw error;
      }

      if (error instanceof Error) {
        throw new InvalidDashboardQueryError(error.message);
      }

      throw error;
    }
  }
}

export function normalizeQuery(query: DashboardQuery): NormalizedDashboardQuery {
  const normalized: NormalizedDashboardQuery = {};

  if (query.from) {
    assertIsoDateTime(query.from, 'from');
    normalized.from = query.from;
  }

  if (query.to) {
    assertIsoDateTime(query.to, 'to');
    normalized.to = query.to;
  }

  if (normalized.from && normalized.to && Date.parse(normalized.from) > Date.parse(normalized.to)) {
    throw new Error('from must be before or equal to to.');
  }

  if (query.corralId) {
    assertUuid(query.corralId, 'corralId');
    normalized.corralId = query.corralId;
  }

  return normalized;
}
