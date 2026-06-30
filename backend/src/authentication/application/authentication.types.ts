import type { AuthenticatedUserDto, User } from '../domain/user';

export type LoginRequestDto = {
  email: string;
  password: string;
};

export type LoginResponseDto = {
  accessToken: string;
  expiresIn: number;
  user: AuthenticatedUserDto;
};

export type UserRepository = {
  findByEmail(email: string): Promise<User | null>;
};

export type PasswordHasher = {
  hash(password: string): Promise<string>;
  verify(password: string, passwordHash: string): Promise<boolean>;
};

export type TokenPayload = {
  sub: string;
  email: string;
  role: string;
};

export type TokenService = {
  sign(payload: TokenPayload): Promise<{ accessToken: string; expiresIn: number }>;
  verify(accessToken: string): Promise<TokenPayload>;
};
