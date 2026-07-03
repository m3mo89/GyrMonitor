import { Controller, Get, Inject, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { Roles } from '../../authentication/domain/role';
import { JwtAuthenticationGuard } from '../../authentication/http/authentication.guard';
import { RoleAuthorizationGuard, RolesAllowed } from '../../authentication/http/roles.guard';
import type { DashboardMetricsResponseDto } from '../application/dashboard.types';
import { GetDashboardMetricsUseCase } from '../application/get-dashboard-metrics.use-case';
import type { ApiSuccess } from '../../shared/http/api-response';

@ApiTags('dashboard')
@ApiBearerAuth()
@Controller('dashboard')
@UseGuards(JwtAuthenticationGuard, RoleAuthorizationGuard)
export class DashboardController {
  constructor(@Inject(GetDashboardMetricsUseCase) private readonly getDashboardMetricsUseCase: GetDashboardMetricsUseCase) {}

  @Get()
  @RolesAllowed(Roles.ADMIN, Roles.RESEARCHER)
  @ApiOperation({ summary: 'Get aggregated dashboard metrics, optionally filtered by date range and corral.' })
  async metrics(
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('corralId') corralId?: string
  ): Promise<ApiSuccess<DashboardMetricsResponseDto>> {
    return {
      success: true,
      data: await this.getDashboardMetricsUseCase.execute({ from, to, corralId })
    };
  }
}
