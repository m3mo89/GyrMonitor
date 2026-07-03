import { Body, Controller, Get, Inject, Param, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { Roles } from '../../authentication/domain/role';
import { JwtAuthenticationGuard } from '../../authentication/http/authentication.guard';
import { RoleAuthorizationGuard, RolesAllowed } from '../../authentication/http/roles.guard';
import type { AddAlertObservationRequestDto, AlertObservationListDto } from '../application/observation.types';
import { AddAlertObservationUseCase } from '../application/add-alert-observation.use-case';
import { ListAlertObservationsUseCase } from '../application/list-alert-observations.use-case';
import type { ObservationDto } from '../domain/observation';
import type { ApiSuccess } from '../../shared/http/api-response';

type AuthenticatedRequest = {
  user?: {
    sub?: string;
    role?: string;
  };
};

@ApiTags('observations')
@ApiBearerAuth()
@Controller('alerts/:alertId/observations')
@UseGuards(JwtAuthenticationGuard, RoleAuthorizationGuard)
export class ObservationsController {
  constructor(
    @Inject(AddAlertObservationUseCase) private readonly addAlertObservationUseCase: AddAlertObservationUseCase,
    @Inject(ListAlertObservationsUseCase) private readonly listAlertObservationsUseCase: ListAlertObservationsUseCase
  ) {}

  @Post()
  @RolesAllowed(Roles.ADMIN, Roles.FIELD_OPERATOR)
  @ApiOperation({ summary: 'Add a field observation to an alert.' })
  async create(
    @Param('alertId') alertId: string,
    @Body() body: AddAlertObservationRequestDto,
    @Req() request: AuthenticatedRequest
  ): Promise<ApiSuccess<ObservationDto>> {
    return {
      success: true,
      data: await this.addAlertObservationUseCase.execute({
        alertId,
        observationId: body?.observationId,
        comment: body?.comment,
        createdAt: body?.createdAt,
        clientId: body?.clientId,
        userId: request.user?.sub ?? ''
      })
    };
  }

  @Get()
  @RolesAllowed(Roles.ADMIN, Roles.FIELD_OPERATOR, Roles.RESEARCHER)
  @ApiOperation({ summary: 'List observations recorded against an alert.' })
  async list(@Param('alertId') alertId: string): Promise<ApiSuccess<AlertObservationListDto>> {
    return {
      success: true,
      data: await this.listAlertObservationsUseCase.execute(alertId)
    };
  }
}
