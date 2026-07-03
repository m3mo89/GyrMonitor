import { Controller, Get, Inject, Param, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { GetCattleDetailUseCase } from '../application/get-cattle-detail.use-case';
import { GetCattleHistoryUseCase } from '../application/get-cattle-history.use-case';
import { ListCattleUseCase } from '../application/list-cattle.use-case';
import { Roles } from '../../authentication/domain/role';
import { JwtAuthenticationGuard } from '../../authentication/http/authentication.guard';
import { RoleAuthorizationGuard, RolesAllowed } from '../../authentication/http/roles.guard';
import type { ApiSuccess } from '../../shared/http/api-response';

@ApiTags('cattle')
@ApiBearerAuth()
@Controller('cattle')
@UseGuards(JwtAuthenticationGuard, RoleAuthorizationGuard)
export class CattleController {
  constructor(
    @Inject(ListCattleUseCase) private readonly listCattleUseCase: ListCattleUseCase,
    @Inject(GetCattleDetailUseCase) private readonly getCattleDetailUseCase: GetCattleDetailUseCase,
    @Inject(GetCattleHistoryUseCase) private readonly getCattleHistoryUseCase: GetCattleHistoryUseCase
  ) {}

  @Get()
  @RolesAllowed(Roles.ADMIN, Roles.RESEARCHER)
  @ApiOperation({ summary: 'List cattle with pagination.' })
  async list(@Query('page') page?: string, @Query('pageSize') pageSize?: string) {
    const result = await this.listCattleUseCase.execute({
      page: page ? Number(page) : undefined,
      pageSize: pageSize ? Number(pageSize) : undefined
    });

    return {
      success: true,
      data: result.data,
      pagination: result.pagination
    };
  }

  @Get(':id/events')
  @RolesAllowed(Roles.ADMIN, Roles.RESEARCHER)
  @ApiOperation({ summary: 'Get paginated activity-event history for a single animal.' })
  async history(
    @Param('id') id: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string
  ): Promise<ApiSuccess<Awaited<ReturnType<GetCattleHistoryUseCase['execute']>>>> {
    return {
      success: true,
      data: await this.getCattleHistoryUseCase.execute(id, {
        page: page ? Number(page) : undefined,
        pageSize: pageSize ? Number(pageSize) : undefined
      })
    };
  }

  @Get(':id')
  @RolesAllowed(Roles.ADMIN, Roles.RESEARCHER)
  @ApiOperation({ summary: 'Get detail for a single animal.' })
  async detail(@Param('id') id: string): Promise<ApiSuccess<Awaited<ReturnType<GetCattleDetailUseCase['execute']>>>> {
    return {
      success: true,
      data: await this.getCattleDetailUseCase.execute(id)
    };
  }
}
