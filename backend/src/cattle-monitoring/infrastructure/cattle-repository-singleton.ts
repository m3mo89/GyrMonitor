import { MariaDbCattleRepository } from './mariadb-cattle.repository';

export const sharedCattleRepository = new MariaDbCattleRepository();
