import {
  BadRequestException,
  Body,
  ConflictException,
  Controller,
  Get,
  Headers,
  Inject,
  InternalServerErrorException,
  Post,
  Query,
  Req,
  UseGuards
} from '@nestjs/common';

import { Roles } from '../../authentication/domain/role';
import { JwtAuthenticationGuard } from '../../authentication/http/authentication.guard';
import { RoleAuthorizationGuard, RolesAllowed } from '../../authentication/http/roles.guard';
import { IdempotencyConflictError, InvalidSyncInputError } from '../application/offline-sync.errors';
import { GetSyncStatusUseCase } from '../application/get-sync-status.use-case';
import { SyncEventsUseCase } from '../application/sync-events.use-case';
import { SyncObservationsUseCase } from '../application/sync-observations.use-case';
import type {
  SyncEventsRequestDto,
  SyncEventsResultDto,
  SyncObservationsRequestDto,
  SyncObservationsResultDto,
  SyncStatusResponseDto
} from '../application/offline-sync.types';

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
    code: 'VALIDATION_ERROR' | 'IDEMPOTENCY_CONFLICT' | 'INTERNAL_ERROR';
    message: string;
  };
};

@Controller('sync')
@UseGuards(JwtAuthenticationGuard, RoleAuthorizationGuard)
export class OfflineSyncController {
  constructor(
    @Inject(SyncEventsUseCase) private readonly syncEventsUseCase: SyncEventsUseCase,
    @Inject(SyncObservationsUseCase) private readonly syncObservationsUseCase: SyncObservationsUseCase,
    @Inject(GetSyncStatusUseCase) private readonly getSyncStatusUseCase: GetSyncStatusUseCase
  ) {}

  @Post('events')
  @RolesAllowed(Roles.ADMIN, Roles.FIELD_OPERATOR, Roles.SYSTEM_GENERATOR)
  async syncEvents(
    @Body() body: SyncEventsRequestDto,
    @Headers('idempotency-key') idempotencyKey?: string
  ): Promise<ApiSuccess<SyncEventsResultDto>> {
    try {
      return {
        success: true,
        data: await this.syncEventsUseCase.execute({
          clientId: body?.clientId,
          deviceId: body?.deviceId,
          items: body?.items,
          idempotencyKey: idempotencyKey ?? ''
        })
      };
    } catch (error) {
      throw toHttpError(error);
    }
  }

  @Post('observations')
  @RolesAllowed(Roles.ADMIN, Roles.FIELD_OPERATOR)
  async syncObservations(
    @Body() body: SyncObservationsRequestDto,
    @Headers('idempotency-key') idempotencyKey: string | undefined,
    @Req() request: AuthenticatedRequest
  ): Promise<ApiSuccess<SyncObservationsResultDto>> {
    try {
      return {
        success: true,
        data: await this.syncObservationsUseCase.execute({
          clientId: body?.clientId,
          items: body?.items,
          idempotencyKey: idempotencyKey ?? '',
          userId: request.user?.sub ?? ''
        })
      };
    } catch (error) {
      throw toHttpError(error);
    }
  }

  @Get('status')
  @RolesAllowed(Roles.ADMIN, Roles.FIELD_OPERATOR)
  async status(@Query('clientId') clientId?: string): Promise<ApiSuccess<SyncStatusResponseDto>> {
    try {
      return {
        success: true,
        data: await this.getSyncStatusUseCase.execute({ clientId })
      };
    } catch (error) {
      throw toHttpError(error);
    }
  }
}

function toHttpError(error: unknown) {
  if (error instanceof InvalidSyncInputError) {
    return new BadRequestException(apiError('VALIDATION_ERROR', error.message));
  }

  if (error instanceof IdempotencyConflictError) {
    return new ConflictException(apiError('IDEMPOTENCY_CONFLICT', error.message));
  }

  return new InternalServerErrorException(apiError('INTERNAL_ERROR', 'Unexpected offline-sync error.'));
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
