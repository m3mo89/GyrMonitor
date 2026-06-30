import { EventTypes, SourceTypes } from '../activity-events/domain/activity-event';
import { Roles } from '../authentication/domain/role';
import { NodePasswordHasher } from '../authentication/infrastructure/node-password-hasher';
import { appConfig } from '../config/app.config';
import { CattleSex, CattleStatus } from '../cattle-monitoring/domain/cattle';
import type { DatabaseClient } from './database.types';
import { toDatabaseDateTime } from './date-mapping';

export async function seedDatabase(client: DatabaseClient): Promise<void> {
  const hasher = new NodePasswordHasher(appConfig.passwordHashIterations);

  await seedUsers(client, hasher);
  await seedCattle(client);
  await seedActivityEvents(client);
  await seedAlerts(client);
  await seedObservations(client);
}

async function seedUsers(client: DatabaseClient, hasher: NodePasswordHasher): Promise<void> {
  const users = [
    {
      id: '00000000-0000-4000-8000-000000000001',
      name: 'Administrador',
      email: 'admin@gyrmonitor.local',
      role: Roles.ADMIN,
      password: 'local-admin-password'
    },
    {
      id: '00000000-0000-4000-8000-000000000002',
      name: 'Investigador',
      email: 'researcher@gyrmonitor.local',
      role: Roles.RESEARCHER,
      password: 'local-researcher-password'
    },
    {
      id: '00000000-0000-4000-8000-000000000003',
      name: 'Operador de Campo',
      email: 'field@gyrmonitor.local',
      role: Roles.FIELD_OPERATOR,
      password: 'local-field-password'
    },
    {
      id: '00000000-0000-4000-8000-000000000004',
      name: 'Generador del Sistema',
      email: 'system@gyrmonitor.local',
      role: Roles.SYSTEM_GENERATOR,
      password: 'local-system-password'
    }
  ];

  for (const user of users) {
    await client.execute(
      `INSERT INTO users (id, name, email, normalized_email, role, password_hash)
       VALUES (?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         name = VALUES(name),
         email = VALUES(email),
         normalized_email = VALUES(normalized_email),
         role = VALUES(role),
         password_hash = VALUES(password_hash)`,
      [user.id, user.name, user.email, user.email.toLowerCase(), user.role, await hasher.hash(user.password)]
    );
  }
}

async function seedCattle(client: DatabaseClient): Promise<void> {
  const cattle = [
    {
      id: '10000000-0000-4000-8000-000000000001',
      tagNumber: 'GYR-001',
      breed: 'Gyr',
      sex: CattleSex.FEMALE,
      birthDate: '2021-03-14',
      status: CattleStatus.ACTIVE,
      createdAt: '2026-06-26T00:00:00.000Z',
      lastRiskScore: 18.5
    },
    {
      id: '10000000-0000-4000-8000-000000000002',
      tagNumber: 'GYR-014',
      breed: 'Gyr',
      sex: CattleSex.FEMALE,
      birthDate: '2020-09-02',
      status: CattleStatus.UNDER_OBSERVATION,
      createdAt: '2026-06-26T00:00:00.000Z',
      lastRiskScore: 72
    },
    {
      id: '10000000-0000-4000-8000-000000000003',
      tagNumber: 'GYR-023',
      breed: 'Gyr',
      sex: CattleSex.FEMALE,
      birthDate: undefined,
      status: CattleStatus.ACTIVE,
      createdAt: '2026-06-26T00:00:00.000Z',
      lastRiskScore: 87.5
    },
    {
      id: '10000000-0000-4000-8000-000000000004',
      tagNumber: 'GYR-031',
      breed: 'Gyr',
      sex: CattleSex.MALE,
      birthDate: '2019-11-21',
      status: CattleStatus.INACTIVE,
      createdAt: '2026-06-26T00:00:00.000Z',
      lastRiskScore: undefined
    }
  ];

  for (const record of cattle) {
    await client.execute(
      `INSERT INTO cattle (id, tag_number, breed, sex, birth_date, status, last_risk_score, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         tag_number = VALUES(tag_number),
         breed = VALUES(breed),
         sex = VALUES(sex),
         birth_date = VALUES(birth_date),
         status = VALUES(status),
         last_risk_score = VALUES(last_risk_score)`,
      [
        record.id,
        record.tagNumber,
        record.breed,
        record.sex,
        record.birthDate ?? null,
        record.status,
        record.lastRiskScore ?? null,
        toDatabaseDateTime(record.createdAt)
      ]
    );
  }
}

async function seedActivityEvents(client: DatabaseClient): Promise<void> {
  const events = [
    {
      id: '30000000-0000-4000-8000-000000000001',
      eventId: '30000000-0000-4000-8000-000000000101',
      deviceId: 'simulator-001',
      cattleId: '10000000-0000-4000-8000-000000000001',
      eventType: EventTypes.ACTIVITY,
      inactiveMinutes: undefined,
      confidence: 0.88,
      capturedAt: '2026-06-29T08:00:00.000Z',
      source: SourceTypes.CONTROLLED_TEST_DATA,
      createdAt: '2026-06-29T08:00:05.000Z'
    },
    {
      id: '30000000-0000-4000-8000-000000000002',
      eventId: '30000000-0000-4000-8000-000000000102',
      deviceId: 'simulator-001',
      cattleId: '10000000-0000-4000-8000-000000000002',
      eventType: EventTypes.INACTIVITY,
      inactiveMinutes: 90,
      confidence: 0.94,
      capturedAt: '2026-06-29T09:30:00.000Z',
      source: SourceTypes.CONTROLLED_TEST_DATA,
      createdAt: '2026-06-29T09:30:05.000Z'
    }
  ];

  for (const event of events) {
    await client.execute(
      `INSERT INTO activity_events (
         id, event_id, device_id, cattle_id, event_type, inactive_minutes, confidence, captured_at, source_type, created_at
       )
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         device_id = VALUES(device_id),
         cattle_id = VALUES(cattle_id),
         event_type = VALUES(event_type),
         inactive_minutes = VALUES(inactive_minutes),
         confidence = VALUES(confidence),
         captured_at = VALUES(captured_at),
         source_type = VALUES(source_type)`,
      [
        event.id,
        event.eventId,
        event.deviceId,
        event.cattleId,
        event.eventType,
        event.inactiveMinutes ?? null,
        event.confidence,
        toDatabaseDateTime(event.capturedAt),
        event.source,
        toDatabaseDateTime(event.createdAt)
      ]
    );
  }
}

async function seedAlerts(client: DatabaseClient): Promise<void> {
  const alerts = [
    {
      id: '20000000-0000-4000-8000-000000000001',
      cattleId: '10000000-0000-4000-8000-000000000002',
      sourceEventId: '30000000-0000-4000-8000-000000000002',
      severity: 'HIGH',
      status: 'PENDING',
      createdAt: '2026-06-29T09:31:00.000Z'
    },
    {
      id: '20000000-0000-4000-8000-000000000002',
      cattleId: '10000000-0000-4000-8000-000000000001',
      sourceEventId: null,
      severity: 'LOW',
      status: 'ATTENDED',
      createdAt: '2026-06-29T10:00:00.000Z'
    }
  ];

  for (const alert of alerts) {
    await client.execute(
      `INSERT INTO alerts (id, cattle_id, source_event_id, severity, status, created_at)
       VALUES (?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         cattle_id = VALUES(cattle_id),
         source_event_id = VALUES(source_event_id),
         severity = VALUES(severity),
         status = VALUES(status)`,
      [alert.id, alert.cattleId, alert.sourceEventId, alert.severity, alert.status, toDatabaseDateTime(alert.createdAt)]
    );
  }
}

async function seedObservations(client: DatabaseClient): Promise<void> {
  await client.execute(
    `INSERT INTO observations (id, observation_id, alert_id, user_id, client_id, comment, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE
       alert_id = VALUES(alert_id),
       user_id = VALUES(user_id),
       client_id = VALUES(client_id),
       comment = VALUES(comment),
       created_at = VALUES(created_at)`,
    [
      '40000000-0000-4000-8000-000000000001',
      '40000000-0000-4000-8000-000000000101',
      '20000000-0000-4000-8000-000000000001',
      '00000000-0000-4000-8000-000000000003',
      'seed-client',
      'Animal reviewed during controlled seed scenario.',
      toDatabaseDateTime('2026-06-29T09:45:00.000Z')
    ]
  );
}
