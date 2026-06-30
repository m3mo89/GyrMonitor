export const Roles = {
  ADMIN: 'ADMIN',
  FIELD_OPERATOR: 'FIELD_OPERATOR',
  RESEARCHER: 'RESEARCHER',
  SYSTEM_GENERATOR: 'SYSTEM_GENERATOR'
} as const;

export type Role = (typeof Roles)[keyof typeof Roles];

export type AuthenticatedUser = {
  id: string;
  name: string;
  email: string;
  role: Role;
};

export type LoginRequestDto = {
  email: string;
  password: string;
};

export type LoginResponseDto = {
  accessToken: string;
  expiresIn: number;
  user: AuthenticatedUser;
};

export type SessionState = {
  accessToken: string;
  user: AuthenticatedUser;
};
