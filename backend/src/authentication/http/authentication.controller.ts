import { BadRequestException, Body, Controller, InternalServerErrorException, Post, UnauthorizedException } from '@nestjs/common';

import { InvalidCredentialsError, ValidationError } from '../application/authentication.errors';
import type { LoginRequestDto } from '../application/authentication.types';
import { LoginUseCase } from '../application/login.use-case';
import { HmacJwtTokenService } from '../infrastructure/hmac-jwt-token.service';
import { parseJwtExpiresInSeconds } from '../infrastructure/jwt-expiration';
import { LocalUserRepository } from '../infrastructure/local-user.repository';
import { NodePasswordHasher } from '../infrastructure/node-password-hasher';
import { appConfig } from '../../config/app.config';

const expiresInSeconds = parseJwtExpiresInSeconds(appConfig.jwtExpiresIn);
const passwordHasher = new NodePasswordHasher(appConfig.passwordHashIterations);
const loginUseCase = new LoginUseCase(
  new LocalUserRepository(passwordHasher),
  passwordHasher,
  new HmacJwtTokenService(appConfig.jwtSecret, expiresInSeconds)
);

export type ApiSuccess<T> = {
  success: true;
  data: T;
};

export type ApiError = {
  success: false;
  error: {
    code: 'VALIDATION_ERROR' | 'UNAUTHORIZED' | 'FORBIDDEN' | 'INTERNAL_ERROR';
    message: string;
  };
};

@Controller('/api/v1/auth')
export class AuthenticationController {
  @Post('login')
  async login(@Body() request: LoginRequestDto) {
    try {
      return {
        success: true,
        data: await loginUseCase.execute(request)
      };
    } catch (error) {
      if (error instanceof ValidationError) {
        throw new BadRequestException(validationError('Email and password are required.'));
      }

      if (error instanceof InvalidCredentialsError) {
        throw new UnauthorizedException(unauthorizedError());
      }

      throw new InternalServerErrorException(internalError());
    }
  }
}

export function validationError(message: string): ApiError {
  return {
    success: false,
    error: {
      code: 'VALIDATION_ERROR',
      message
    }
  };
}

export function unauthorizedError(): ApiError {
  return {
    success: false,
    error: {
      code: 'UNAUTHORIZED',
      message: 'Invalid credentials.'
    }
  };
}

export function forbiddenError(): ApiError {
  return {
    success: false,
    error: {
      code: 'FORBIDDEN',
      message: 'The authenticated user does not have permission.'
    }
  };
}

export function internalError(): ApiError {
  return {
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message: 'Unexpected authentication error.'
    }
  };
}
