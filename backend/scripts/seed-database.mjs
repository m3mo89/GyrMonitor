import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { createConfiguredMariaDbClient } = require('../dist/database/mysql2-driver.js');
const { seedDatabase } = require('../dist/database/seeds.js');

const client = createConfiguredMariaDbClient();

try {
  await seedDatabase(client);
  console.log('MariaDB seed data complete.');
} finally {
  await client.close();
}
