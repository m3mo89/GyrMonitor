import { Module } from '@nestjs/common';

import { CreateUserUseCase } from './application/create-user.use-case';
import { DisableUserUseCase } from './application/disable-user.use-case';
import { ListUsersUseCase } from './application/list-users.use-case';
import { ReactivateUserUseCase } from './application/reactivate-user.use-case';
import { ResetPasswordUseCase } from './application/reset-password.use-case';
import { UserManagementController } from './http/user-management.controller';
import {
  createUserUseCase,
  disableUserUseCase,
  listUsersUseCase,
  reactivateUserUseCase,
  resetPasswordUseCase
} from './infrastructure/user-management-singletons';

@Module({
  controllers: [UserManagementController],
  providers: [
    { provide: CreateUserUseCase, useValue: createUserUseCase },
    { provide: ListUsersUseCase, useValue: listUsersUseCase },
    { provide: DisableUserUseCase, useValue: disableUserUseCase },
    { provide: ReactivateUserUseCase, useValue: reactivateUserUseCase },
    { provide: ResetPasswordUseCase, useValue: resetPasswordUseCase }
  ]
})
export class UserManagementModule {}
