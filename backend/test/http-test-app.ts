import { ForbiddenException, UnauthorizedException, type INestApplication, type Provider, type Type } from '@nestjs/common';
import { ExpressAdapter } from '@nestjs/platform-express';
import { Test } from '@nestjs/testing';

import { Roles, type Role } from '../src/authentication/domain/role';
import { JwtAuthenticationGuard } from '../src/authentication/http/authentication.guard';
import { RoleAuthorizationGuard } from '../src/authentication/http/roles.guard';

export type TestUser = {
  sub: string;
  role: Role;
};

export type TestAuthMode = 'unauthenticated' | 'authenticated';

export async function createHttpTestApp(options: {
  controllers: Type<unknown>[];
  providers: Provider[];
  authMode?: TestAuthMode;
  user?: TestUser;
}): Promise<INestApplication> {
  const authMode = options.authMode ?? 'authenticated';
  const user = options.user ?? {
    sub: '11111111-1111-4111-8111-111111111111',
    role: Roles.ADMIN
  };

  const moduleRef = await Test.createTestingModule({
    controllers: options.controllers,
    providers: options.providers
  })
    .overrideGuard(JwtAuthenticationGuard)
    .useValue({
      canActivate: (context: { switchToHttp: () => { getRequest: () => { user?: TestUser } } }) => {
        if (authMode === 'unauthenticated') {
          throw new UnauthorizedException();
        }

        context.switchToHttp().getRequest().user = user;
        return true;
      }
    })
    .compile();

  const app = moduleRef.createNestApplication(new ExpressAdapter());
  await app.init();
  return app;
}

export const forbiddenRoleGuard = {
  canActivate: () => {
    throw new ForbiddenException();
  }
};

export const roleAuthorizationGuardProvider: Provider = {
  provide: RoleAuthorizationGuard,
  useClass: RoleAuthorizationGuard
};
