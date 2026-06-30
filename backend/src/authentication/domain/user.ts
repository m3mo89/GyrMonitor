import type { Role } from './role';

export type User = {
  id: string;
  name: string;
  email: string;
  role: Role;
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
