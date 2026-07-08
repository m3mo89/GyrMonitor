import { MariaDbUserRepository } from '../../authentication/infrastructure/mariadb-user.repository';
import { NodePasswordHasher } from '../../authentication/infrastructure/node-password-hasher';
import { appConfig } from '../../config/app.config';
import { CreateUserUseCase } from '../application/create-user.use-case';
import { DisableUserUseCase } from '../application/disable-user.use-case';
import { ListUsersUseCase } from '../application/list-users.use-case';
import { ReactivateUserUseCase } from '../application/reactivate-user.use-case';
import { ResetPasswordUseCase } from '../application/reset-password.use-case';

export const sharedUserRepository = new MariaDbUserRepository();
const sharedPasswordHasher = new NodePasswordHasher(appConfig.passwordHashIterations);

export const createUserUseCase = new CreateUserUseCase(sharedUserRepository, sharedPasswordHasher);
export const listUsersUseCase = new ListUsersUseCase(sharedUserRepository);
export const disableUserUseCase = new DisableUserUseCase(sharedUserRepository);
export const reactivateUserUseCase = new ReactivateUserUseCase(sharedUserRepository);
export const resetPasswordUseCase = new ResetPasswordUseCase(sharedUserRepository, sharedPasswordHasher);
