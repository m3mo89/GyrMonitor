import { Body, Controller, Get, Headers, Inject, Post, Query, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { Roles } from '../../authentication/domain/role';
import { JwtAuthenticationGuard } from '../../authentication/http/authentication.guard';
import { RoleAuthorizationGuard, RolesAllowed } from '../../authentication/http/roles.guard';
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
import type { ApiSuccess } from '../../shared/http/api-response';

type AuthenticatedRequest = {
  user?: {
    sub?: string;
    role?: string;
  };
};

@ApiTags('sync')
@ApiBearerAuth()
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
  @ApiOperation({ summary: 'Batch-sync offline-recorded activity events using an idempotency key.' })
  async syncEvents(
    @Body() body: SyncEventsRequestDto,
    @Headers('idempotency-key') idempotencyKey?: string
  ): Promise<ApiSuccess<SyncEventsResultDto>> {
    return {
      success: true,
      data: await this.syncEventsUseCase.execute({
        clientId: body?.clientId,
        deviceId: body?.deviceId,
        items: body?.items,
        idempotencyKey: idempotencyKey ?? ''
      })
    };
  }

  @Post('observations')
  @RolesAllowed(Roles.ADMIN, Roles.FIELD_OPERATOR)
  @ApiOperation({ summary: 'Batch-sync offline-recorded alert observations using an idempotency key.' })
  async syncObservations(
    @Body() body: SyncObservationsRequestDto,
    @Headers('idempotency-key') idempotencyKey: string | undefined,
    @Req() request: AuthenticatedRequest
  ): Promise<ApiSuccess<SyncObservationsResultDto>> {
    return {
      success: true,
      data: await this.syncObservationsUseCase.execute({
        clientId: body?.clientId,
        items: body?.items,
        idempotencyKey: idempotencyKey ?? '',
        userId: request.user?.sub ?? ''
      })
    };
  }

  @Get('status')
  @RolesAllowed(Roles.ADMIN, Roles.FIELD_OPERATOR)
  @ApiOperation({ summary: 'Get sync status for a client device.' })
  async status(@Query('clientId') clientId?: string): Promise<ApiSuccess<SyncStatusResponseDto>> {
    return {
      success: true,
      data: await this.getSyncStatusUseCase.execute({ clientId })
    };
  }
}
