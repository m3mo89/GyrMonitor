import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { createConfiguredMariaDbClient } = require('../dist/database/mysql2-driver.js');
const { runMigrations } = require('../dist/database/migrations.js');

const client = createConfiguredMariaDbClient();

try {
  const applied = await runMigrations(client);
  console.log(`MariaDB migrations complete. Applied ${applied.length} migration(s).`);
  if (applied.length > 0) {
    console.log(`Applied versions: ${applied.join(', ')}`);
  }
} finally {
  await client.close();
}
