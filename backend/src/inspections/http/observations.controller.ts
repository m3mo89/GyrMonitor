import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Inject,
  InternalServerErrorException,
  NotFoundException,
  Param,
  Post,
  Req,
  UseGuards
} from '@nestjs/common';

import { Roles } from '../../authentication/domain/role';
import { JwtAuthenticationGuard } from '../../authentication/http/authentication.guard';
import { RoleAuthorizationGuard, RolesAllowed } from '../../authentication/http/roles.guard';
import { AlertNotFoundError, InvalidObservationInputError } from '../application/observation.errors';
import type { AddAlertObservationRequestDto, AlertObservationListDto } from '../application/observation.types';
import { AddAlertObservationUseCase } from '../application/add-alert-observation.use-case';
import { ListAlertObservationsUseCase } from '../application/list-alert-observations.use-case';
import type { ObservationDto } from '../domain/observation';

type AuthenticatedRequest = {
  user?: {
    sub?: string;
    role?: string;
  };
};

type ApiSuccess<T> = {
  success: true;
  data: T;
};

type ApiError = {
  success: false;
  error: {
    code: 'VALIDATION_ERROR' | 'NOT_FOUND' | 'INTERNAL_ERROR';
    message: string;
  };
};

@Controller('alerts/:alertId/observations')
@UseGuards(JwtAuthenticationGuard, RoleAuthorizationGuard)
export class ObservationsController {
  constructor(
    @Inject(AddAlertObservationUseCase) private readonly addAlertObservationUseCase: AddAlertObservationUseCase,
    @Inject(ListAlertObservationsUseCase) private readonly listAlertObservationsUseCase: ListAlertObservationsUseCase
  ) {}

  @Post()
  @RolesAllowed(Roles.ADMIN, Roles.FIELD_OPERATOR)
  async create(
    @Param('alertId') alertId: string,
    @Body() body: AddAlertObservationRequestDto,
    @Req() request: AuthenticatedRequest
  ): Promise<ApiSuccess<ObservationDto>> {
    try {
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
    } catch (error) {
      throw toHttpError(error);
    }
  }

  @Get()
  @RolesAllowed(Roles.ADMIN, Roles.FIELD_OPERATOR, Roles.RESEARCHER)
  async list(@Param('alertId') alertId: string): Promise<ApiSuccess<AlertObservationListDto>> {
    try {
      return {
        success: true,
        data: await this.listAlertObservationsUseCase.execute(alertId)
      };
    } catch (error) {
      throw toHttpError(error);
    }
  }
}

function toHttpError(error: unknown) {
  if (error instanceof InvalidObservationInputError) {
    return new BadRequestException(apiError('VALIDATION_ERROR', error.message));
  }

  if (error instanceof AlertNotFoundError) {
    return new NotFoundException(apiError('NOT_FOUND', error.message));
  }

  return new InternalServerErrorException(apiError('INTERNAL_ERROR', 'Unexpected inspections error.'));
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
