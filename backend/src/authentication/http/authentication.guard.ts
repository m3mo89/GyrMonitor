import type { CanActivate, ExecutionContext } from '@nestjs/common';

import { HmacJwtTokenService } from '../infrastructure/hmac-jwt-token.service';
import { parseJwtExpiresInSeconds } from '../infrastructure/jwt-expiration';
import { appConfig } from '../../config/app.config';

const tokenService = new HmacJwtTokenService(appConfig.jwtSecret, parseJwtExpiresInSeconds(appConfig.jwtExpiresIn));

export class JwtAuthenticationGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authorization = request.headers?.authorization;
    const token = typeof authorization === 'string' && authorization.startsWith('Bearer ')
      ? authorization.slice('Bearer '.length)
      : null;

    if (!token) {
      return false;
    }

    try {
      request.user = await tokenService.verify(token);
      return true;
    } catch {
      return false;
    }
  }
}
