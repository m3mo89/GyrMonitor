import { Body, Controller, Get, Inject, Param, Patch, Query, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { Roles } from '../../authentication/domain/role';
import { JwtAuthenticationGuard } from '../../authentication/http/authentication.guard';
import { RoleAuthorizationGuard, RolesAllowed } from '../../authentication/http/roles.guard';
import type {
  AlertDetailResponseDto,
  AlertListResponseDto,
  UpdateAlertStatusRequestDto,
  UpdateAlertStatusResponseDto
} from '../application/alert.types';
import { GetAlertDetailUseCase } from '../application/get-alert-detail.use-case';
import { ListAlertsUseCase } from '../application/list-alerts.use-case';
import { UpdateAlertStatusUseCase } from '../application/update-alert-status.use-case';
import type { ApiSuccess } from '../../shared/http/api-response';

type RequestWithUser = {
  user?: {
    sub?: string;
  };
};

@ApiTags('alerts')
@ApiBearerAuth()
@Controller('alerts')
@UseGuards(JwtAuthenticationGuard, RoleAuthorizationGuard)
export class AlertsController {
  constructor(
    @Inject(ListAlertsUseCase) private readonly listAlertsUseCase: ListAlertsUseCase,
    @Inject(GetAlertDetailUseCase) private readonly getAlertDetailUseCase: GetAlertDetailUseCase,
    @Inject(UpdateAlertStatusUseCase) private readonly updateAlertStatusUseCase: UpdateAlertStatusUseCase
  ) {}

  @Get()
  @RolesAllowed(Roles.ADMIN, Roles.FIELD_OPERATOR, Roles.RESEARCHER)
  @ApiOperation({ summary: 'List alerts, filterable by status, severity, and cattle.' })
  async list(
    @Query('status') status?: string,
    @Query('severity') severity?: string,
    @Query('cattleId') cattleId?: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string
  ): Promise<ApiSuccess<AlertListResponseDto['data']>> {
    const result = await this.listAlertsUseCase.execute({
      status,
      severity,
      cattleId,
      page: page ? Number(page) : undefined,
      pageSize: pageSize ? Number(pageSize) : undefined
    });

    return {
      success: true,
      data: result.data,
      pagination: result.pagination
    };
  }

  @Get(':id')
  @RolesAllowed(Roles.ADMIN, Roles.FIELD_OPERATOR, Roles.RESEARCHER)
  @ApiOperation({ summary: 'Get detail for a single alert.' })
  async detail(@Param('id') id: string): Promise<ApiSuccess<AlertDetailResponseDto>> {
    return {
      success: true,
      data: await this.getAlertDetailUseCase.execute(id)
    };
  }

  @Patch(':id/status')
  @RolesAllowed(Roles.FIELD_OPERATOR, Roles.ADMIN)
  @ApiOperation({ summary: 'Update the status of an alert (e.g. mark attended).' })
  async updateStatus(
    @Param('id') id: string,
    @Body() body: UpdateAlertStatusRequestDto,
    @Req() request: RequestWithUser
  ): Promise<ApiSuccess<UpdateAlertStatusResponseDto>> {
    return {
      success: true,
      data: await this.updateAlertStatusUseCase.execute({
        alertId: id,
        status: body?.status,
        attendedAt: body?.attendedAt,
        userId: request.user?.sub
      })
    };
  }
}
