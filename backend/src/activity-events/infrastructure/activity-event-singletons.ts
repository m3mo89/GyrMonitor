import { sharedCattleRepository } from '../../cattle-monitoring/infrastructure/cattle-repository-singleton';
import { GetCattleActivityEventHistoryUseCase } from '../application/get-cattle-activity-event-history.use-case';
import { ListActivityEventsUseCase } from '../application/list-activity-events.use-case';
import { RegisterActivityEventUseCase } from '../application/register-activity-event.use-case';
import { MariaDbActivityEventRepository } from './mariadb-activity-event.repository';

export const sharedActivityEventRepository = new MariaDbActivityEventRepository();
export const sharedActivityEventCattleRepository = sharedCattleRepository;
export const registerActivityEventUseCase = new RegisterActivityEventUseCase(
  sharedActivityEventRepository,
  sharedActivityEventCattleRepository
);
export const listActivityEventsUseCase = new ListActivityEventsUseCase(sharedActivityEventRepository);
export const getCattleActivityEventHistoryUseCase = new GetCattleActivityEventHistoryUseCase(
  sharedActivityEventRepository,
  sharedActivityEventCattleRepository
);
