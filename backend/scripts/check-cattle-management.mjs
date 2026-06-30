import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = process.cwd();
const source = (path) => readFileSync(resolve(root, path), 'utf8');

const domain = source('src/cattle-monitoring/domain/cattle.ts');
assert.match(domain, /CattleSex/);
assert.match(domain, /CattleStatus/);
assert.match(domain, /breed: record\.breed \?\? 'Gyr'/);
assert.match(domain, /toCattleSummaryDto/);
assert.match(domain, /toCattleDetailDto/);

const repository = source('src/cattle-monitoring/infrastructure/local-cattle.repository.ts');
const tagNumbers = [...repository.matchAll(/tagNumber: '(GYR-\d+)'/g)].map((match) => match[1]);
assert.equal(new Set(tagNumbers).size, tagNumbers.length);
assert.ok(tagNumbers.length >= 4);
assert.match(repository, /CattleStatus\.UNDER_OBSERVATION/);
assert.match(repository, /CattleSex\.MALE/);
assert.match(repository, /assertUniqueTagNumbers/);
assert.match(repository, /findById/);
assert.match(repository, /exists/);

const listUseCase = source('src/cattle-monitoring/application/list-cattle.use-case.ts');
assert.match(listUseCase, /pagination/);
assert.match(listUseCase, /toCattleSummaryDto/);
assert.match(listUseCase, /pageSize/);

const detailUseCase = source('src/cattle-monitoring/application/get-cattle-detail.use-case.ts');
assert.match(detailUseCase, /InvalidCattleIdError/);
assert.match(detailUseCase, /CattleNotFoundError/);
assert.match(detailUseCase, /toCattleDetailDto/);

const historyUseCase = source('src/cattle-monitoring/application/get-cattle-history.use-case.ts');
assert.match(historyUseCase, /placeholder: true/);
assert.match(historyUseCase, /events: \[\]/);
assert.match(historyUseCase, /activity-events phase/);
assert.match(historyUseCase, /CattleNotFoundError/);

const controller = source('src/cattle-monitoring/http/cattle.controller.ts');
assert.match(controller, /@Controller\('\/api\/v1\/cattle'\)/);
assert.match(controller, /@Get\(\)/);
assert.match(controller, /@Get\(':id'\)/);
assert.match(controller, /@Get\(':id\/events'\)/);
assert.match(controller, /JwtAuthenticationGuard/);
assert.match(controller, /RoleAuthorizationGuard/);
assert.match(controller, /Roles\.ADMIN, Roles\.RESEARCHER/);
assert.match(controller, /NotFoundException/);
assert.match(controller, /BadRequestException/);

const authGuard = source('src/authentication/http/authentication.guard.ts');
assert.match(authGuard, /UnauthorizedException/);

const roleGuard = source('src/authentication/http/roles.guard.ts');
assert.match(roleGuard, /ForbiddenException/);

console.log('Backend cattle-management checks passed.');
