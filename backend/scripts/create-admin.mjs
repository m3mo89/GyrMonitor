import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { createConfiguredMariaDbClient } = require('../dist/database/mysql2-driver.js');
const { MariaDbUserRepository } = require('../dist/authentication/infrastructure/mariadb-user.repository.js');
const { NodePasswordHasher } = require('../dist/authentication/infrastructure/node-password-hasher.js');
const { Roles } = require('../dist/authentication/domain/role.js');
const { appConfig } = require('../dist/config/app.config.js');
const { CreateUserUseCase } = require('../dist/user-management/application/create-user.use-case.js');
const { EmailAlreadyExistsError, InvalidUserInputError } = require('../dist/user-management/application/user-management.errors.js');

const name = process.env.ADMIN_NAME || 'Administrador';
const email = process.env.ADMIN_EMAIL;
const password = process.env.ADMIN_PASSWORD;

if (!email) {
  console.error('ADMIN_EMAIL is required.');
  process.exitCode = 1;
} else if (!password) {
  console.error('ADMIN_PASSWORD is required.');
  process.exitCode = 1;
} else {
  const client = createConfiguredMariaDbClient();
  const users = new MariaDbUserRepository(client);
  const passwordHasher = new NodePasswordHasher(appConfig.passwordHashIterations);
  const createUserUseCase = new CreateUserUseCase(users, passwordHasher);

  try {
    const created = await createUserUseCase.execute({ name, email, role: Roles.ADMIN, password });
    console.log(`Admin created: id=${created.id} email=${created.email} role=${created.role}`);
  } catch (error) {
    if (error instanceof EmailAlreadyExistsError || error instanceof InvalidUserInputError) {
      console.error(error.message);
    } else {
      console.error('Failed to create admin.');
      console.error(error instanceof Error ? error.message : String(error));
    }
    process.exitCode = 1;
  } finally {
    await client.close();
  }
}
