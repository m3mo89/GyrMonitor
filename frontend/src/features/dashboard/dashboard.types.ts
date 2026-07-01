export type DashboardRiskRankingItem = {
  cattleId: string;
  tagNumber: string;
  riskScore: number;
};

export type DashboardTrendItem = {
  date: string;
  events: number;
  alerts: number;
};

export type DashboardMetrics = {
  totalCattle: number;
  activeAlerts: number;
  averageRiskScore: number;
  highRiskCattle: number;
  eventsToday: number;
  syncPendingCount: number;
  riskRanking: DashboardRiskRankingItem[];
  trend: DashboardTrendItem[];
};
