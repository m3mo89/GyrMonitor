import {
  BadRequestException,
  Controller,
  Get,
  Inject,
  InternalServerErrorException,
  NotFoundException,
  Param,
  Query,
  UseGuards
} from '@nestjs/common';

import { CattleNotFoundError, InvalidCattleIdError } from '../application/cattle.errors';
import { GetCattleDetailUseCase } from '../application/get-cattle-detail.use-case';
import { GetCattleHistoryUseCase } from '../application/get-cattle-history.use-case';
import { ListCattleUseCase } from '../application/list-cattle.use-case';
import { Roles } from '../../authentication/domain/role';
import { JwtAuthenticationGuard } from '../../authentication/http/authentication.guard';
import { RoleAuthorizationGuard, RolesAllowed } from '../../authentication/http/roles.guard';

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
  async history(
    @Param('id') id: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string
  ): Promise<ApiSuccess<Awaited<ReturnType<GetCattleHistoryUseCase['execute']>>>> {
    try {
      return {
        success: true,
        data: await this.getCattleHistoryUseCase.execute(id, {
          page: page ? Number(page) : undefined,
          pageSize: pageSize ? Number(pageSize) : undefined
        })
      };
    } catch (error) {
      throw toHttpError(error);
    }
  }

  @Get(':id')
  @RolesAllowed(Roles.ADMIN, Roles.RESEARCHER)
  async detail(@Param('id') id: string): Promise<ApiSuccess<Awaited<ReturnType<GetCattleDetailUseCase['execute']>>>> {
    try {
      return {
        success: true,
        data: await this.getCattleDetailUseCase.execute(id)
      };
    } catch (error) {
      throw toHttpError(error);
    }
  }
}

function toHttpError(error: unknown) {
  if (error instanceof InvalidCattleIdError) {
    return new BadRequestException(apiError('VALIDATION_ERROR', error.message));
  }

  if (error instanceof CattleNotFoundError) {
    return new NotFoundException(apiError('NOT_FOUND', error.message));
  }

  return new InternalServerErrorException(apiError('INTERNAL_ERROR', 'Unexpected cattle-monitoring error.'));
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
