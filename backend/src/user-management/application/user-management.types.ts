import type { Role } from '../../authentication/domain/role';
import type { UserStatus } from '../../authentication/domain/user';

export type UserSummaryDto = {
  id: string;
  name: string;
  email: string;
  role: Role;
  status: UserStatus;
};

export type CreateUserRequestDto = {
  name: string;
  email: string;
  role: string;
  password: string;
};

export type CreateUserCommand = CreateUserRequestDto;

export type DisableUserCommand = {
  targetUserId: string;
  actingUserId: string;
};

export type ReactivateUserCommand = {
  targetUserId: string;
};

export type ResetPasswordRequestDto = {
  newPassword: string;
};

export type ResetPasswordCommand = {
  targetUserId: string;
  newPassword: string;
};
