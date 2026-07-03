import { Body, Controller, Get, Headers, Inject, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { Roles } from '../../authentication/domain/role';
import { JwtAuthenticationGuard } from '../../authentication/http/authentication.guard';
import { RoleAuthorizationGuard, RolesAllowed } from '../../authentication/http/roles.guard';
import type {
  ActivityEventListResponseDto,
  RegisterActivityEventRequestDto,
  RegisterActivityEventResultDto
} from '../application/activity-event.types';
import { ListActivityEventsUseCase } from '../application/list-activity-events.use-case';
import { RegisterActivityEventUseCase } from '../application/register-activity-event.use-case';
import type { ApiSuccess } from '../../shared/http/api-response';

@ApiTags('events')
@ApiBearerAuth()
@Controller('events')
@UseGuards(JwtAuthenticationGuard, RoleAuthorizationGuard)
export class ActivityEventsController {
  constructor(
    @Inject(RegisterActivityEventUseCase) private readonly registerActivityEventUseCase: RegisterActivityEventUseCase,
    @Inject(ListActivityEventsUseCase) private readonly listActivityEventsUseCase: ListActivityEventsUseCase
  ) {}

  @Post()
  @RolesAllowed(Roles.ADMIN, Roles.SYSTEM_GENERATOR)
  @ApiOperation({ summary: 'Register a cattle activity event (e.g. from a device or system generator).' })
  async create(
    @Body() body: RegisterActivityEventRequestDto,
    @Headers('idempotency-key') idempotencyKey?: string
  ): Promise<ApiSuccess<RegisterActivityEventResultDto>> {
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
  }

  @Get()
  @RolesAllowed(Roles.ADMIN, Roles.RESEARCHER)
  @ApiOperation({ summary: 'List activity events, filterable by cattle, event type, and date range.' })
  async list(
    @Query('cattleId') cattleId?: string,
    @Query('eventType') eventType?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string
  ): Promise<ApiSuccess<ActivityEventListResponseDto['data']>> {
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
  }
}
