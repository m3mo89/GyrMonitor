import { InvalidCredentialsError, ValidationError } from './authentication.errors';
import type { LoginRequestDto, LoginResponseDto, PasswordHasher, TokenService, UserRepository } from './authentication.types';
import { toAuthenticatedUserDto, UserStatuses } from '../domain/user';

export class LoginUseCase {
  private readonly users: UserRepository;
  private readonly passwordHasher: PasswordHasher;
  private readonly tokenService: TokenService;

  constructor(
    users: UserRepository,
    passwordHasher: PasswordHasher,
    tokenService: TokenService
  ) {
    this.users = users;
    this.passwordHasher = passwordHasher;
    this.tokenService = tokenService;
  }

  async execute(request: LoginRequestDto): Promise<LoginResponseDto> {
    const email = request.email?.trim().toLowerCase();
    const password = request.password;

    if (!email || !password) {
      throw new ValidationError('Email and password are required.');
    }

    const user = await this.users.findByEmail(email);
    const passwordMatches = user ? await this.passwordHasher.verify(password, user.passwordHash) : false;

    if (!user || !passwordMatches || user.status === UserStatuses.DISABLED) {
      throw new InvalidCredentialsError();
    }

    const token = await this.tokenService.sign({
      sub: user.id,
      email: user.email,
      role: user.role
    });

    return {
      accessToken: token.accessToken,
      expiresIn: token.expiresIn,
      user: toAuthenticatedUserDto(user)
    };
  }
}
