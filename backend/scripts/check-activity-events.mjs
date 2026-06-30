import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = process.cwd();
const source = (path) => readFileSync(resolve(root, path), 'utf8');

const domain = source('src/activity-events/domain/activity-event.ts');
assert.match(domain, /export const EventTypes/);
assert.match(domain, /ACTIVITY/);
assert.match(domain, /INACTIVITY/);
assert.match(domain, /export const SourceTypes/);
assert.match(domain, /DESKTOP_SIMULATOR/);
assert.match(domain, /MANUAL_ENTRY/);
assert.match(domain, /CONTROLLED_TEST_DATA/);
assert.match(domain, /type ActivityEvent =/);
assert.match(domain, /eventId: string/);
assert.match(domain, /deviceId: string/);
assert.match(domain, /cattleId: string/);
assert.match(domain, /inactiveMinutes\?: number/);
assert.match(domain, /confidence: number/);
assert.match(domain, /capturedAt: string/);
assert.match(domain, /createdAt: string/);
assert.match(domain, /assertInactiveMinutes/);
assert.match(domain, /assertConfidence/);
assert.match(domain, /assertIsoDateTime/);
assert.match(domain, /toRegisterActivityEventResponse/);
assert.match(domain, /alertGenerated: false/);

const types = source('src/activity-events/application/activity-event.types.ts');
assert.match(types, /ActivityEventRepository/);
assert.match(types, /save\(event: ActivityEvent\)/);
assert.match(types, /findByEventId/);
assert.match(types, /list\(query: NormalizedActivityEventsQuery\)/);
assert.match(types, /CattleLookup/);
assert.match(types, /RegisterActivityEventRequestDto/);
assert.match(types, /RegisterActivityEventResultDto/);
assert.match(types, /ActivityEventListResponseDto/);
assert.match(types, /CattleActivityEventHistoryDto/);
assert.match(types, /idempotencyKey\?: string/);

const registerUseCase = source('src/activity-events/application/register-activity-event.use-case.ts');
assert.match(registerUseCase, /RegisterActivityEventUseCase/);
assert.match(registerUseCase, /findByEventId\(command\.eventId\)/);
assert.match(registerUseCase, /toRegisterActivityEventResponse\(existing\)/);
assert.match(registerUseCase, /assertEventType\(command\.eventType\)/);
assert.match(registerUseCase, /assertSourceType\(command\.source\)/);
assert.match(registerUseCase, /cattle\.exists\(command\.cattleId\)/);
assert.match(registerUseCase, /ActivityEventCattleNotFoundError/);
assert.match(registerUseCase, /InvalidActivityEventInputError/);
assert.match(registerUseCase, /capturedAt: command\.capturedAt/);

const listUseCase = source('src/activity-events/application/list-activity-events.use-case.ts');
assert.match(listUseCase, /ListActivityEventsUseCase/);
assert.match(listUseCase, /normalizeQuery/);
assert.match(listUseCase, /assertUuid\(query\.cattleId, 'cattleId'\)/);
assert.match(listUseCase, /assertEventType\(query\.eventType\)/);
assert.match(listUseCase, /assertIsoDateTime\(query\.from, 'from'\)/);
assert.match(listUseCase, /assertIsoDateTime\(query\.to, 'to'\)/);
assert.match(listUseCase, /pageSize: Math\.min/);

const historyQuery = source('src/activity-events/application/get-cattle-activity-event-history.use-case.ts');
assert.match(historyQuery, /GetCattleActivityEventHistoryUseCase/);
assert.match(historyQuery, /assertUuid\(cattleId, 'cattleId'\)/);
assert.match(historyQuery, /cattle\.exists\(cattleId\)/);
assert.match(historyQuery, /events\.list/);
assert.match(historyQuery, /toActivityEventDto/);

const repository = source('src/activity-events/infrastructure/local-activity-event.repository.ts');
assert.match(repository, /backendIdByEventId/);
assert.match(repository, /recordsById/);
assert.match(repository, /existingId/);
assert.match(repository, /findByEventId/);
assert.match(repository, /record\.cattleId === query\.cattleId/);
assert.match(repository, /record\.eventType === query\.eventType/);
assert.match(repository, /record\.capturedAt >= query\.from/);
assert.match(repository, /record\.capturedAt <= query\.to/);
assert.match(repository, /capturedAt\.localeCompare/);
assert.match(repository, /pagination/);

const singletons = source('src/activity-events/infrastructure/activity-event-singletons.ts');
assert.match(singletons, /sharedActivityEventRepository/);
assert.match(singletons, /LocalCattleRepository/);
assert.match(singletons, /registerActivityEventUseCase/);
assert.match(singletons, /listActivityEventsUseCase/);

const controller = source('src/activity-events/http/activity-events.controller.ts');
assert.match(controller, /@Controller\('events'\)/);
assert.match(controller, /@Post\(\)/);
assert.match(controller, /@Get\(\)/);
assert.match(controller, /@Headers\('idempotency-key'\)/);
assert.match(controller, /JwtAuthenticationGuard/);
assert.match(controller, /RoleAuthorizationGuard/);
assert.match(controller, /Roles\.ADMIN, Roles\.SYSTEM_GENERATOR/);
assert.match(controller, /Roles\.ADMIN, Roles\.RESEARCHER/);
assert.match(controller, /BadRequestException/);
assert.match(controller, /NotFoundException/);
assert.match(controller, /InternalServerErrorException/);
assert.match(controller, /VALIDATION_ERROR/);
assert.match(controller, /NOT_FOUND/);

const cattleTypes = source('src/cattle-monitoring/application/cattle.types.ts');
assert.match(cattleTypes, /CattleHistoryDto/);
assert.match(cattleTypes, /ActivityEventDto/);
assert.doesNotMatch(cattleTypes, /CattleHistoryPlaceholderDto/);

const cattleHistoryUseCase = source('src/cattle-monitoring/application/get-cattle-history.use-case.ts');
assert.match(cattleHistoryUseCase, /ActivityEventRepository/);
assert.match(cattleHistoryUseCase, /events\.list/);
assert.match(cattleHistoryUseCase, /toActivityEventDto/);
assert.match(cattleHistoryUseCase, /normalizePositiveInteger/);
assert.doesNotMatch(cattleHistoryUseCase, /placeholder: true/);

const cattleController = source('src/cattle-monitoring/http/cattle.controller.ts');
assert.match(cattleController, /sharedActivityEventRepository/);
assert.match(cattleController, /page: page \? Number\(page\) : undefined/);
assert.match(cattleController, /pageSize: pageSize \? Number\(pageSize\) : undefined/);

const appModule = source('src/app.module.ts');
assert.match(appModule, /ActivityEventsModule/);

console.log('Backend activity-events checks passed.');
