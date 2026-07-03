import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { listActivityEventsUseCase, registerActivityEventUseCase } = require('../dist/activity-events/infrastructure/activity-event-singletons.js');
const { NodePasswordHasher } = require('../dist/authentication/infrastructure/node-password-hasher.js');
const { MariaDbUserRepository } = require('../dist/authentication/infrastructure/mariadb-user.repository.js');
const { appConfig } = require('../dist/config/app.config.js');
const { closeSharedDatabaseClient } = require('../dist/database/database-singleton.js');
const { runMigrations } = require('../dist/database/migrations.js');
const { createConfiguredMariaDbClient } = require('../dist/database/mysql2-driver.js');
const { seedDatabase } = require('../dist/database/seeds.js');
const { sharedAlertEventLookup, sharedAlertRepository } = require('../dist/alerts/infrastructure/alert-singletons.js');
const { RepositoryAlertCattleLookup } = require('../dist/alerts/infrastructure/alert-lookups.js');
const { GetAlertDetailUseCase } = require('../dist/alerts/application/get-alert-detail.use-case.js');
const { ListAlertsUseCase } = require('../dist/alerts/application/list-alerts.use-case.js');
const { sharedCattleRepository } = require('../dist/cattle-monitoring/infrastructure/cattle-repository-singleton.js');
const { addAlertObservationUseCase, listAlertObservationsUseCase } = require('../dist/inspections/infrastructure/observation-singletons.js');

// Mirrors the Nest DI wiring in alerts.module.ts: alerts' cattle lookup is built here from the
// shared cattle repository since this script runs outside the Nest container.
const alertCattleLookup = new RepositoryAlertCattleLookup(sharedCattleRepository);
const listAlertsUseCase = new ListAlertsUseCase(sharedAlertRepository, alertCattleLookup);
const getAlertDetailUseCase = new GetAlertDetailUseCase(sharedAlertRepository, alertCattleLookup, sharedAlertEventLookup);

const client = createConfiguredMariaDbClient();

try {
  const firstRun = await runMigrations(client);
  const secondRun = await runMigrations(client);
  assert.equal(secondRun.length, 0, 'migrations must be idempotent on second run');

  await seedDatabase(client);

  const users = new MariaDbUserRepository(client);
  const admin = await users.findByEmail('admin@gyrmonitor.local');
  assert.ok(admin, 'seeded admin user should exist');
  assert.equal(admin.role, 'ADMIN');
  assert.equal(await new NodePasswordHasher(appConfig.passwordHashIterations).verify('local-admin-password', admin.passwordHash), true);

  const event = await registerActivityEventUseCase.execute({
    eventId: '30000000-0000-4000-8000-000000000099',
    deviceId: 'db-check-device',
    cattleId: '10000000-0000-4000-8000-000000000001',
    eventType: 'INACTIVITY',
    inactiveMinutes: 45,
    confidence: 0.91,
    capturedAt: '2026-06-30T10:00:00.000Z',
    source: 'CONTROLLED_TEST_DATA'
  });
  assert.equal(event.alertGenerated, false);
  const duplicateEvent = await registerActivityEventUseCase.execute({
    eventId: '30000000-0000-4000-8000-000000000099',
    deviceId: 'db-check-device',
    cattleId: '10000000-0000-4000-8000-000000000001',
    eventType: 'INACTIVITY',
    inactiveMinutes: 45,
    confidence: 0.91,
    capturedAt: '2026-06-30T10:00:00.000Z',
    source: 'CONTROLLED_TEST_DATA'
  });
  assert.equal(duplicateEvent.eventId, event.eventId);
  assert.equal(duplicateEvent.alertGenerated, false);

  const alertingEvent = await registerActivityEventUseCase.execute({
    eventId: '30000000-0000-4000-8000-000000000098',
    deviceId: 'db-check-device',
    cattleId: '10000000-0000-4000-8000-000000000003',
    eventType: 'INACTIVITY',
    inactiveMinutes: 90,
    confidence: 0.93,
    capturedAt: '2026-06-30T10:10:00.000Z',
    source: 'CONTROLLED_TEST_DATA'
  });
  assert.equal(alertingEvent.alertGenerated, true);
  assert.equal(alertingEvent.riskScore, 90);
  assert.equal(alertingEvent.severity, 'HIGH');
  assert.ok(alertingEvent.alertId, 'alerting inactivity event should return an alert id');

  const duplicateAlertingEvent = await registerActivityEventUseCase.execute({
    eventId: '30000000-0000-4000-8000-000000000098',
    deviceId: 'db-check-device',
    cattleId: '10000000-0000-4000-8000-000000000003',
    eventType: 'INACTIVITY',
    inactiveMinutes: 90,
    confidence: 0.93,
    capturedAt: '2026-06-30T10:10:00.000Z',
    source: 'CONTROLLED_TEST_DATA'
  });
  assert.equal(duplicateAlertingEvent.alertGenerated, true);
  assert.equal(duplicateAlertingEvent.alertId, alertingEvent.alertId);

  const events = await listActivityEventsUseCase.execute({
    cattleId: '10000000-0000-4000-8000-000000000001',
    eventType: 'INACTIVITY',
    from: '2026-06-30T00:00:00.000Z',
    to: '2026-06-30T23:59:59.999Z'
  });
  assert.ok(events.data.some((record) => record.eventId === event.eventId));
  assert.equal(events.data.find((record) => record.eventId === event.eventId)?.capturedAt, '2026-06-30T10:00:00.000Z');

  const alerts = await listAlertsUseCase.execute({ status: 'PENDING', severity: 'HIGH', cattleId: '10000000-0000-4000-8000-000000000003' });
  assert.ok(alerts.data.some((record) => record.id === alertingEvent.alertId), 'generated alert should be listable from MariaDB');
  const alertDetail = await getAlertDetailUseCase.execute(alertingEvent.alertId);
  assert.equal(alertDetail.cattleId, '10000000-0000-4000-8000-000000000003');
  assert.equal(alertDetail.eventId, '30000000-0000-4000-8000-000000000098');

  const observation = await addAlertObservationUseCase.execute({
    alertId: '20000000-0000-4000-8000-000000000001',
    observationId: '40000000-0000-4000-8000-000000000099',
    userId: '00000000-0000-4000-8000-000000000001',
    comment: 'Database check observation',
    createdAt: '2026-06-30T10:05:00.000Z'
  });
  const duplicateObservation = await addAlertObservationUseCase.execute({
    alertId: '20000000-0000-4000-8000-000000000001',
    observationId: '40000000-0000-4000-8000-000000000099',
    userId: '00000000-0000-4000-8000-000000000001',
    comment: 'Database check observation',
    createdAt: '2026-06-30T10:05:00.000Z'
  });
  assert.equal(duplicateObservation.id, observation.id);
  assert.equal(observation.createdAt, '2026-06-30T10:05:00.000Z');

  const observations = await listAlertObservationsUseCase.execute('20000000-0000-4000-8000-000000000001');
  assert.ok(observations.some((record) => record.id === observation.id));

  console.log(`Database persistence checks passed. Migrations applied on first run: ${firstRun.length}.`);
} catch (error) {
  console.error('Database persistence checks failed.');
  console.error(formatError(error));
  process.exitCode = 1;
} finally {
  await client.close();
  await closeSharedDatabaseClient();
}

function formatError(error) {
  if (!(error instanceof Error)) {
    return String(error);
  }

  const details = [];
  if ('code' in error && error.code) {
    details.push(`code=${error.code}`);
  }
  if ('errno' in error && error.errno) {
    details.push(`errno=${error.errno}`);
  }
  if ('address' in error && error.address) {
    details.push(`address=${error.address}`);
  }
  if ('port' in error && error.port) {
    details.push(`port=${error.port}`);
  }
  if ('errors' in error && Array.isArray(error.errors)) {
    for (const inner of error.errors) {
      if (inner instanceof Error) {
        const innerDetails = [];
        if ('code' in inner && inner.code) {
          innerDetails.push(`code=${inner.code}`);
        }
        if ('address' in inner && inner.address) {
          innerDetails.push(`address=${inner.address}`);
        }
        if ('port' in inner && inner.port) {
          innerDetails.push(`port=${inner.port}`);
        }
        details.push(`inner(${[inner.message || inner.name, innerDetails.join(' ')].filter(Boolean).join(' ')})`);
      }
    }
  }

  return [error.message || error.name, details.join(' ')].filter(Boolean).join(' ');
}
