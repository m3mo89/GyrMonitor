import type { CanActivate, ExecutionContext } from '@nestjs/common';

import type { Role } from '../domain/role';

export const routeRoles = new WeakMap<object, Role[]>();

export function RolesAllowed(...roles: Role[]) {
  return function rolesDecorator(target: object, propertyKey?: string | symbol) {
    const key = propertyKey ? target[propertyKey as keyof typeof target] as object : target;
    routeRoles.set(key, roles);
  };
}

export class RoleAuthorizationGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const handler = context.getHandler();
    const allowedRoles = routeRoles.get(handler);

    if (!allowedRoles || allowedRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    return allowedRoles.includes(request.user?.role);
  }
}
