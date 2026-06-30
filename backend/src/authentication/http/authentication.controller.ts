import { BadRequestException, Body, Controller, Inject, InternalServerErrorException, Post, UnauthorizedException } from '@nestjs/common';

import { InvalidCredentialsError, ValidationError } from '../application/authentication.errors';
import type { LoginRequestDto } from '../application/authentication.types';
import { LoginUseCase } from '../application/login.use-case';

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

@Controller('auth')
export class AuthenticationController {
  constructor(@Inject(LoginUseCase) private readonly loginUseCase: LoginUseCase) {}

  @Post('login')
  async login(@Body() request: LoginRequestDto) {
    try {
      return {
        success: true,
        data: await this.loginUseCase.execute(request)
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
