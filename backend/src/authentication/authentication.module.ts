import { Module } from '@nestjs/common';

import { LoginUseCase } from './application/login.use-case';
import { AuthenticationController } from './http/authentication.controller';
import { HmacJwtTokenService } from './infrastructure/hmac-jwt-token.service';
import { parseJwtExpiresInSeconds } from './infrastructure/jwt-expiration';
import { MariaDbUserRepository } from './infrastructure/mariadb-user.repository';
import { NodePasswordHasher } from './infrastructure/node-password-hasher';
import { appConfig } from '../config/app.config';

const passwordHasher = new NodePasswordHasher(appConfig.passwordHashIterations);

@Module({
  controllers: [AuthenticationController],
  providers: [
    {
      provide: LoginUseCase,
      useFactory: () =>
        new LoginUseCase(
          new MariaDbUserRepository(),
          passwordHasher,
          new HmacJwtTokenService(appConfig.jwtSecret, parseJwtExpiresInSeconds(appConfig.jwtExpiresIn))
        )
    }
  ]
})
export class AuthenticationModule {}
