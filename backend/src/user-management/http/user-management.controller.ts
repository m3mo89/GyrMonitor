import { Body, Controller, Get, Inject, Param, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { Roles } from '../../authentication/domain/role';
import { JwtAuthenticationGuard } from '../../authentication/http/authentication.guard';
import { RoleAuthorizationGuard, RolesAllowed } from '../../authentication/http/roles.guard';
import type { ApiSuccess } from '../../shared/http/api-response';
import { CreateUserUseCase } from '../application/create-user.use-case';
import { DisableUserUseCase } from '../application/disable-user.use-case';
import { ListUsersUseCase } from '../application/list-users.use-case';
import { ReactivateUserUseCase } from '../application/reactivate-user.use-case';
import { ResetPasswordUseCase } from '../application/reset-password.use-case';
import type { CreateUserRequestDto, ResetPasswordRequestDto, UserSummaryDto } from '../application/user-management.types';

type RequestWithUser = {
  user?: {
    sub?: string;
  };
};

@ApiTags('users')
@ApiBearerAuth()
@Controller('users')
@UseGuards(JwtAuthenticationGuard, RoleAuthorizationGuard)
export class UserManagementController {
  constructor(
    @Inject(CreateUserUseCase) private readonly createUserUseCase: CreateUserUseCase,
    @Inject(ListUsersUseCase) private readonly listUsersUseCase: ListUsersUseCase,
    @Inject(DisableUserUseCase) private readonly disableUserUseCase: DisableUserUseCase,
    @Inject(ReactivateUserUseCase) private readonly reactivateUserUseCase: ReactivateUserUseCase,
    @Inject(ResetPasswordUseCase) private readonly resetPasswordUseCase: ResetPasswordUseCase
  ) {}

  @Post()
  @RolesAllowed(Roles.ADMIN)
  @ApiOperation({ summary: 'Create a new user (ADMIN only).' })
  async create(@Body() body: CreateUserRequestDto): Promise<ApiSuccess<UserSummaryDto>> {
    return {
      success: true,
      data: await this.createUserUseCase.execute(body)
    };
  }

  @Get()
  @RolesAllowed(Roles.ADMIN)
  @ApiOperation({ summary: 'List every user with role and status (ADMIN only).' })
  async list(): Promise<ApiSuccess<UserSummaryDto[]>> {
    return {
      success: true,
      data: await this.listUsersUseCase.execute()
    };
  }

  @Post(':id/disable')
  @RolesAllowed(Roles.ADMIN)
  @ApiOperation({ summary: "Disable a user's login access without deleting the record (ADMIN only)." })
  async disable(@Param('id') id: string, @Req() request: RequestWithUser): Promise<ApiSuccess<UserSummaryDto>> {
    return {
      success: true,
      data: await this.disableUserUseCase.execute({ targetUserId: id, actingUserId: request.user?.sub ?? '' })
    };
  }

  @Post(':id/reactivate')
  @RolesAllowed(Roles.ADMIN)
  @ApiOperation({ summary: 'Reactivate a previously disabled user (ADMIN only).' })
  async reactivate(@Param('id') id: string): Promise<ApiSuccess<UserSummaryDto>> {
    return {
      success: true,
      data: await this.reactivateUserUseCase.execute({ targetUserId: id })
    };
  }

  @Post(':id/reset-password')
  @RolesAllowed(Roles.ADMIN)
  @ApiOperation({ summary: "Set a new password for a user (ADMIN only)." })
  async resetPassword(@Param('id') id: string, @Body() body: ResetPasswordRequestDto): Promise<ApiSuccess<UserSummaryDto>> {
    return {
      success: true,
      data: await this.resetPasswordUseCase.execute({ targetUserId: id, newPassword: body?.newPassword })
    };
  }
}
