import type { Role } from './role';

export const UserStatuses = {
  ACTIVE: 'ACTIVE',
  DISABLED: 'DISABLED'
} as const;

export type UserStatus = (typeof UserStatuses)[keyof typeof UserStatuses];

export function isUserStatus(value: string): value is UserStatus {
  return value === UserStatuses.ACTIVE || value === UserStatuses.DISABLED;
}

export type User = {
  id: string;
  name: string;
  email: string;
  role: Role;
  status: UserStatus;
  passwordHash: string;
};

export type AuthenticatedUserDto = {
  id: string;
  name: string;
  email: string;
  role: Role;
};

export function toAuthenticatedUserDto(user: User): AuthenticatedUserDto {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role
  };
}
