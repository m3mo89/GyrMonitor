import type { AuthenticatedUserDto, User, UserStatus } from '../domain/user';
import type { Role } from '../domain/role';

export type LoginRequestDto = {
  email: string;
  password: string;
};

export type LoginResponseDto = {
  accessToken: string;
  expiresIn: number;
  user: AuthenticatedUserDto;
};

export type CreateUserInput = {
  id: string;
  name: string;
  email: string;
  role: Role;
  passwordHash: string;
};

export type UserRepository = {
  findByEmail(email: string): Promise<User | null>;
  findById(id: string): Promise<User | null>;
  create(input: CreateUserInput): Promise<User>;
  findAll(): Promise<User[]>;
  updateStatus(id: string, status: UserStatus): Promise<User | null>;
  updatePasswordHash(id: string, passwordHash: string): Promise<User | null>;
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
