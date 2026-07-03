import { existsSync } from 'node:fs';
import { join } from 'node:path';

const mode = process.argv[2] ?? 'verify';
const root = process.cwd();
const required = [
  'README.md',
  '.env.example',
  'nest-cli.json',
  'tsconfig.json',
  'src/main.ts',
  'src/app.module.ts',
  'src/app.controller.ts',
  'src/config/app.config.ts',
  'src/database/database.errors.ts',
  'src/database/database-singleton.ts',
  'src/database/database.types.ts',
  'src/database/date-mapping.ts',
  'src/database/migrations.ts',
  'src/database/mysql2-driver.ts',
  'src/database/seeds.ts',
  'src/shared/README.md',
  'src/shared/domain/domain-error.ts',
  'src/shared/http/api-response.ts',
  'src/shared/http/domain-error.filter.ts',
  'src/shared/validation/assertions.ts',
  'src/authentication/README.md',
  'src/authentication/authentication.module.ts',
  'src/authentication/domain/role.ts',
  'src/authentication/domain/user.ts',
  'src/authentication/application/authentication.errors.ts',
  'src/authentication/application/authentication.types.ts',
  'src/authentication/application/login.use-case.ts',
  'src/authentication/infrastructure/hmac-jwt-token.service.ts',
  'src/authentication/infrastructure/jwt-expiration.ts',
  'src/authentication/infrastructure/local-user.repository.ts',
  'src/authentication/infrastructure/mariadb-user.repository.ts',
  'src/authentication/infrastructure/node-password-hasher.ts',
  'src/authentication/http/authentication.controller.ts',
  'src/authentication/http/authentication.guard.ts',
  'src/authentication/http/roles.guard.ts',
  'src/cattle-monitoring/README.md',
  'src/cattle-monitoring/cattle-monitoring.module.ts',
  'src/cattle-monitoring/domain/cattle.ts',
  'src/cattle-monitoring/application/cattle.errors.ts',
  'src/cattle-monitoring/application/cattle.types.ts',
  'src/cattle-monitoring/application/get-cattle-detail.use-case.ts',
  'src/cattle-monitoring/application/get-cattle-history.use-case.ts',
  'src/cattle-monitoring/application/list-cattle.use-case.ts',
  'src/cattle-monitoring/infrastructure/cattle-repository-singleton.ts',
  'src/cattle-monitoring/infrastructure/cattle-singletons.ts',
  'src/cattle-monitoring/infrastructure/local-cattle.repository.ts',
  'src/cattle-monitoring/infrastructure/mariadb-cattle.repository.ts',
  'src/cattle-monitoring/http/cattle.controller.ts',
  'src/activity-events/README.md',
  'src/activity-events/activity-events.module.ts',
  'src/activity-events/domain/activity-event.ts',
  'src/activity-events/application/activity-event.errors.ts',
  'src/activity-events/application/activity-event.types.ts',
  'src/activity-events/application/get-cattle-activity-event-history.use-case.ts',
  'src/activity-events/application/list-activity-events.use-case.ts',
  'src/activity-events/application/register-activity-event.use-case.ts',
  'src/activity-events/infrastructure/activity-event-singletons.ts',
  'src/activity-events/infrastructure/local-activity-event.repository.ts',
  'src/activity-events/infrastructure/mariadb-activity-event.repository.ts',
  'src/activity-events/http/activity-events.controller.ts',
  'src/inactivity-analysis/README.md',
  'src/alerts/README.md',
  'src/inspections/README.md',
  'src/inspections/inspections.module.ts',
  'src/inspections/domain/observation.ts',
  'src/inspections/application/add-alert-observation.use-case.ts',
  'src/inspections/application/list-alert-observations.use-case.ts',
  'src/inspections/application/observation.errors.ts',
  'src/inspections/application/observation.types.ts',
  'src/inspections/infrastructure/local-alert.repository.ts',
  'src/inspections/infrastructure/local-observation.repository.ts',
  'src/inspections/infrastructure/mariadb-alert.repository.ts',
  'src/inspections/infrastructure/mariadb-observation.repository.ts',
  'src/inspections/infrastructure/observation-singletons.ts',
  'src/inspections/http/observations.controller.ts',
  'src/dashboard/README.md',
  'src/offline-sync/README.md'
];

const missing = required.filter((path) => !existsSync(join(root, path)));

if (missing.length > 0) {
  console.error(`Backend ${mode} check failed. Missing paths:`);
  for (const path of missing) {
    console.error(`- ${path}`);
  }
  process.exit(1);
}

if (mode === 'test') {
  await import('./check-authentication.mjs');
  await import('./check-cattle-management.mjs');
  await import('./check-activity-events.mjs');
  await import('./check-observations.mjs');
}

console.log(`Backend ${mode} check passed.`);
