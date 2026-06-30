import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = process.cwd();
const source = (path) => readFileSync(resolve(root, path), 'utf8');

const { NodePasswordHasher } = await import('../src/authentication/infrastructure/node-password-hasher.ts');
const { HmacJwtTokenService } = await import('../src/authentication/infrastructure/hmac-jwt-token.service.ts');
const { parseJwtExpiresInSeconds } = await import('../src/authentication/infrastructure/jwt-expiration.ts');

const hasher = new NodePasswordHasher(1000);
const passwordHash = await hasher.hash('local-admin-password');
assert.equal(await hasher.verify('local-admin-password', passwordHash), true);
assert.equal(await hasher.verify('wrong-password', passwordHash), false);
assert.match(passwordHash, /^pbkdf2:sha256:/);

const tokenService = new HmacJwtTokenService('test-secret', 3600);
const signed = await tokenService.sign({
  sub: '00000000-0000-4000-8000-000000000001',
  email: 'admin@gyrmonitor.local',
  role: 'ADMIN'
});
const payload = await tokenService.verify(signed.accessToken);
assert.equal(signed.expiresIn, 3600);
assert.equal(payload.email, 'admin@gyrmonitor.local');
assert.equal(payload.role, 'ADMIN');
await assert.rejects(() => tokenService.verify(`${signed.accessToken}tampered`));
assert.equal(parseJwtExpiresInSeconds('3600s'), 3600);
assert.equal(parseJwtExpiresInSeconds('15m'), 900);
assert.equal(parseJwtExpiresInSeconds('2h'), 7200);

const loginUseCase = source('src/authentication/application/login.use-case.ts');
assert.match(loginUseCase, /InvalidCredentialsError/);
assert.match(loginUseCase, /ValidationError/);
assert.match(loginUseCase, /toAuthenticatedUserDto/);

const userMapper = source('src/authentication/domain/user.ts');
const mapperBody = userMapper.slice(userMapper.indexOf('export function toAuthenticatedUserDto'));
assert.match(mapperBody, /id: user\.id/);
assert.match(mapperBody, /role: user\.role/);
assert.doesNotMatch(mapperBody, /passwordHash|password:/);

const controller = source('src/authentication/http/authentication.controller.ts');
assert.match(controller, /@Post\('login'\)/);
assert.match(controller, /MariaDbUserRepository/);
assert.match(controller, /UnauthorizedException/);
assert.match(controller, /BadRequestException/);
assert.match(controller, /success: true/);

const authGuard = source('src/authentication/http/authentication.guard.ts');
assert.match(authGuard, /authorization/);
assert.match(authGuard, /Bearer /);
assert.match(authGuard, /request\.user/);

const roleGuard = source('src/authentication/http/roles.guard.ts');
assert.match(roleGuard, /FORBIDDEN|RoleAuthorizationGuard|allowedRoles/);
assert.match(roleGuard, /includes\(request\.user\?\.role\)/);

const mariaDbUsers = source('src/authentication/infrastructure/mariadb-user.repository.ts');
assert.match(mariaDbUsers, /normalized_email = \?/);
assert.match(mariaDbUsers, /isRole/);
assert.match(mariaDbUsers, /passwordHash: row\.password_hash/);

console.log('Backend authentication checks passed.');
