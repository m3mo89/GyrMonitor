import { GetDashboardMetricsUseCase } from '../application/get-dashboard-metrics.use-case';
import { MariaDbDashboardDataSource } from './mariadb-dashboard-data-source';

export const sharedDashboardDataSource = new MariaDbDashboardDataSource();
export const getDashboardMetricsUseCase = new GetDashboardMetricsUseCase(sharedDashboardDataSource);
