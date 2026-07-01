export type DashboardQuery = {
  from?: string;
  to?: string;
  corralId?: string;
};

export type NormalizedDashboardQuery = {
  from?: string;
  to?: string;
  corralId?: string;
};

export type DashboardRiskRankingItemDto = {
  cattleId: string;
  tagNumber: string;
  riskScore: number;
};

export type DashboardTrendItemDto = {
  date: string;
  events: number;
  alerts: number;
};

export type DashboardMetricsResponseDto = {
  totalCattle: number;
  activeAlerts: number;
  averageRiskScore: number;
  highRiskCattle: number;
  eventsToday: number;
  syncPendingCount: number;
  riskRanking: DashboardRiskRankingItemDto[];
  trend: DashboardTrendItemDto[];
};

export type DashboardDataSource = {
  getMetrics(query: NormalizedDashboardQuery): Promise<DashboardMetricsResponseDto>;
};
