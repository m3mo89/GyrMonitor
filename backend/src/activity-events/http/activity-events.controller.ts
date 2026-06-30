import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Headers,
  Inject,
  InternalServerErrorException,
  NotFoundException,
  Post,
  Query,
  UseGuards
} from '@nestjs/common';

import { Roles } from '../../authentication/domain/role';
import { JwtAuthenticationGuard } from '../../authentication/http/authentication.guard';
import { RoleAuthorizationGuard, RolesAllowed } from '../../authentication/http/roles.guard';
import { ActivityEventCattleNotFoundError, InvalidActivityEventInputError } from '../application/activity-event.errors';
import type {
  ActivityEventListResponseDto,
  RegisterActivityEventRequestDto,
  RegisterActivityEventResultDto
} from '../application/activity-event.types';
import { ListActivityEventsUseCase } from '../application/list-activity-events.use-case';
import { RegisterActivityEventUseCase } from '../application/register-activity-event.use-case';

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

@Controller('events')
@UseGuards(JwtAuthenticationGuard, RoleAuthorizationGuard)
export class ActivityEventsController {
  constructor(
    @Inject(RegisterActivityEventUseCase) private readonly registerActivityEventUseCase: RegisterActivityEventUseCase,
    @Inject(ListActivityEventsUseCase) private readonly listActivityEventsUseCase: ListActivityEventsUseCase
  ) {}

  @Post()
  @RolesAllowed(Roles.ADMIN, Roles.SYSTEM_GENERATOR)
  async create(
    @Body() body: RegisterActivityEventRequestDto,
    @Headers('idempotency-key') idempotencyKey?: string
  ): Promise<ApiSuccess<RegisterActivityEventResultDto>> {
    try {
      return {
        success: true,
        data: await this.registerActivityEventUseCase.execute({
          eventId: body?.eventId,
          deviceId: body?.deviceId,
          cattleId: body?.cattleId,
          eventType: body?.eventType,
          inactiveMinutes: body?.inactiveMinutes,
          confidence: body?.confidence,
          capturedAt: body?.capturedAt,
          source: body?.source,
          idempotencyKey
        })
      };
    } catch (error) {
      throw toHttpError(error);
    }
  }

  @Get()
  @RolesAllowed(Roles.ADMIN, Roles.RESEARCHER)
  async list(
    @Query('cattleId') cattleId?: string,
    @Query('eventType') eventType?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string
  ): Promise<ApiSuccess<ActivityEventListResponseDto['data']>> {
    try {
      const result = await this.listActivityEventsUseCase.execute({
        cattleId,
        eventType,
        from,
        to,
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
}

function toHttpError(error: unknown) {
  if (error instanceof InvalidActivityEventInputError) {
    return new BadRequestException(apiError('VALIDATION_ERROR', error.message));
  }

  if (error instanceof ActivityEventCattleNotFoundError) {
    return new NotFoundException(apiError('NOT_FOUND', error.message));
  }

  return new InternalServerErrorException(apiError('INTERNAL_ERROR', 'Unexpected activity-events error.'));
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
