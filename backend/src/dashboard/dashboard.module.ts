import { Module } from '@nestjs/common';

import { GetDashboardMetricsUseCase } from './application/get-dashboard-metrics.use-case';
import { getDashboardMetricsUseCase } from './infrastructure/dashboard-singletons';
import { DashboardController } from './http/dashboard.controller';

@Module({
  controllers: [DashboardController],
  providers: [{ provide: GetDashboardMetricsUseCase, useValue: getDashboardMetricsUseCase }]
})
export class DashboardModule {}
