import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = process.cwd();
const source = (path) => readFileSync(resolve(root, path), 'utf8');

const domain = source('src/inspections/domain/observation.ts');
assert.match(domain, /type Observation =/);
assert.match(domain, /observationId: string/);
assert.match(domain, /alertId: string/);
assert.match(domain, /userId: string/);
assert.match(domain, /comment: string/);
assert.match(domain, /createdAt: string/);
assert.match(domain, /clientId\?: string/);
assert.match(domain, /assertNonEmptyComment/);
assert.match(domain, /assertIsoDateTime/);
assert.match(domain, /toObservationDto/);

const types = source('src/inspections/application/observation.types.ts');
assert.match(types, /AddAlertObservationRequestDto/);
assert.match(types, /ObservationRepository/);
assert.match(types, /findByObservationId/);
assert.match(types, /listByAlertId/);
assert.match(types, /AlertLookup/);

const addUseCase = source('src/inspections/application/add-alert-observation.use-case.ts');
assert.match(addUseCase, /AddAlertObservationUseCase/);
assert.match(addUseCase, /findByObservationId\(command\.observationId\)/);
assert.match(addUseCase, /alerts\.exists\(command\.alertId\)/);
assert.match(addUseCase, /userId: command\.userId/);
assert.match(addUseCase, /createdAt: command\.createdAt/);
assert.match(addUseCase, /clientId: command\.clientId/);
assert.match(addUseCase, /AlertNotFoundError/);
assert.match(addUseCase, /InvalidObservationInputError/);

const listUseCase = source('src/inspections/application/list-alert-observations.use-case.ts');
assert.match(listUseCase, /ListAlertObservationsUseCase/);
assert.match(listUseCase, /assertUuid\(alertId, 'alertId'\)/);
assert.match(listUseCase, /alerts\.exists\(alertId\)/);
assert.match(listUseCase, /listByAlertId\(alertId\)/);

const observationRepository = source('src/inspections/infrastructure/local-observation.repository.ts');
assert.match(observationRepository, /backendIdByObservationId/);
assert.match(observationRepository, /recordsById/);
assert.match(observationRepository, /existingId/);
assert.match(observationRepository, /listByAlertId/);
assert.match(observationRepository, /createdAt\.localeCompare/);

const alertRepository = source('src/inspections/infrastructure/local-alert.repository.ts');
const alertIds = [...alertRepository.matchAll(/id: '([0-9a-f-]+)'/g)].map((match) => match[1]);
assert.ok(alertIds.length >= 2);
assert.equal(new Set(alertIds).size, alertIds.length);
assert.match(alertRepository, /exists\(alertId: string\)/);

const controller = source('src/inspections/http/observations.controller.ts');
assert.match(controller, /@Controller\('alerts\/:alertId\/observations'\)/);
assert.match(controller, /@Post\(\)/);
assert.match(controller, /@Get\(\)/);
assert.match(controller, /JwtAuthenticationGuard/);
assert.match(controller, /RoleAuthorizationGuard/);
assert.match(controller, /Roles\.ADMIN, Roles\.FIELD_OPERATOR/);
assert.match(controller, /Roles\.ADMIN, Roles\.FIELD_OPERATOR, Roles\.RESEARCHER/);
assert.match(controller, /request\.user\?\.sub/);
assert.match(controller, /BadRequestException/);
assert.match(controller, /NotFoundException/);
assert.match(controller, /InternalServerErrorException/);
assert.match(controller, /VALIDATION_ERROR/);
assert.match(controller, /NOT_FOUND/);

const localUsers = source('src/authentication/infrastructure/local-user.repository.ts');
assert.match(localUsers, /Roles\.FIELD_OPERATOR/);
assert.match(localUsers, /field@gyrmonitor\.local/);

const module = source('src/inspections/inspections.module.ts');
assert.match(module, /ObservationsController/);

const appModule = source('src/app.module.ts');
assert.match(appModule, /InspectionsModule/);

console.log('Backend observations checks passed.');
