import type { Role } from '../../auth/domain/auth.types';

export type UserStatus = 'ACTIVE' | 'DISABLED';

export type UserSummary = {
  id: string;
  name: string;
  email: string;
  role: Role;
  status: UserStatus;
};

export type CreateUserRequest = {
  name: string;
  email: string;
  role: Role;
  password: string;
};

export type ResetPasswordRequest = {
  newPassword: string;
};
