import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Inject,
  InternalServerErrorException,
  NotFoundException,
  Param,
  Patch,
  Query,
  Req,
  UseGuards
} from '@nestjs/common';

import { Roles } from '../../authentication/domain/role';
import { JwtAuthenticationGuard } from '../../authentication/http/authentication.guard';
import { RoleAuthorizationGuard, RolesAllowed } from '../../authentication/http/roles.guard';
import { AlertNotFoundError, InvalidAlertInputError } from '../application/alert.errors';
import type {
  AlertDetailResponseDto,
  AlertListResponseDto,
  UpdateAlertStatusRequestDto,
  UpdateAlertStatusResponseDto
} from '../application/alert.types';
import { GetAlertDetailUseCase } from '../application/get-alert-detail.use-case';
import { ListAlertsUseCase } from '../application/list-alerts.use-case';
import { UpdateAlertStatusUseCase } from '../application/update-alert-status.use-case';

type ApiSuccess<T> = {
  success: true;
  data: T;
  pagination?: {
    page: number;
    pageSize: number;
    total: number;
  };
};

type ApiError = {
  success: false;
  error: {
    code: 'VALIDATION_ERROR' | 'NOT_FOUND' | 'INTERNAL_ERROR';
    message: string;
  };
};

type RequestWithUser = {
  user?: {
    sub?: string;
  };
};

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
  async list(
    @Query('status') status?: string,
    @Query('severity') severity?: string,
    @Query('cattleId') cattleId?: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string
  ): Promise<ApiSuccess<AlertListResponseDto['data']>> {
    try {
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
    } catch (error) {
      throw toHttpError(error);
    }
  }

  @Get(':id')
  @RolesAllowed(Roles.ADMIN, Roles.FIELD_OPERATOR, Roles.RESEARCHER)
  async detail(@Param('id') id: string): Promise<ApiSuccess<AlertDetailResponseDto>> {
    try {
      return {
        success: true,
        data: await this.getAlertDetailUseCase.execute(id)
      };
    } catch (error) {
      throw toHttpError(error);
    }
  }

  @Patch(':id/status')
  @RolesAllowed(Roles.FIELD_OPERATOR, Roles.ADMIN)
  async updateStatus(
    @Param('id') id: string,
    @Body() body: UpdateAlertStatusRequestDto,
    @Req() request: RequestWithUser
  ): Promise<ApiSuccess<UpdateAlertStatusResponseDto>> {
    try {
      return {
        success: true,
        data: await this.updateAlertStatusUseCase.execute({
          alertId: id,
          status: body?.status,
          attendedAt: body?.attendedAt,
          userId: request.user?.sub
        })
      };
    } catch (error) {
      throw toHttpError(error);
    }
  }
}

function toHttpError(error: unknown) {
  if (error instanceof InvalidAlertInputError) {
    return new BadRequestException(apiError('VALIDATION_ERROR', error.message));
  }

  if (error instanceof AlertNotFoundError) {
    return new NotFoundException(apiError('NOT_FOUND', error.message));
  }

  return new InternalServerErrorException(apiError('INTERNAL_ERROR', 'Unexpected alerts error.'));
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
