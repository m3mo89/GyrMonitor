import { BadRequestException, Controller, Get, Inject, InternalServerErrorException, Query, UseGuards } from '@nestjs/common';

import { Roles } from '../../authentication/domain/role';
import { JwtAuthenticationGuard } from '../../authentication/http/authentication.guard';
import { RoleAuthorizationGuard, RolesAllowed } from '../../authentication/http/roles.guard';
import { InvalidDashboardQueryError } from '../application/dashboard.errors';
import type { DashboardMetricsResponseDto } from '../application/dashboard.types';
import { GetDashboardMetricsUseCase } from '../application/get-dashboard-metrics.use-case';

type ApiSuccess<T> = {
  success: true;
  data: T;
};

type ApiError = {
  success: false;
  error: {
    code: 'VALIDATION_ERROR' | 'INTERNAL_ERROR';
    message: string;
  };
};

@Controller('dashboard')
@UseGuards(JwtAuthenticationGuard, RoleAuthorizationGuard)
export class DashboardController {
  constructor(@Inject(GetDashboardMetricsUseCase) private readonly getDashboardMetricsUseCase: GetDashboardMetricsUseCase) {}

  @Get()
  @RolesAllowed(Roles.ADMIN, Roles.RESEARCHER)
  async metrics(
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('corralId') corralId?: string
  ): Promise<ApiSuccess<DashboardMetricsResponseDto>> {
    try {
      return {
        success: true,
        data: await this.getDashboardMetricsUseCase.execute({ from, to, corralId })
      };
    } catch (error) {
      throw toHttpError(error);
    }
  }
}

function toHttpError(error: unknown) {
  if (error instanceof InvalidDashboardQueryError) {
    return new BadRequestException(apiError('VALIDATION_ERROR', error.message));
  }

  return new InternalServerErrorException(apiError('INTERNAL_ERROR', 'Unexpected dashboard error.'));
}

function apiError(code: ApiError['error']['code'], message: string): ApiError {
  return {
    success: false,
    error: {
      code,
      message
    }
  };
}
