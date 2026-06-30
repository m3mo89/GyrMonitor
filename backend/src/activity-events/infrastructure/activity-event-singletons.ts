import { LocalCattleRepository } from '../../cattle-monitoring/infrastructure/local-cattle.repository';
import { GetCattleActivityEventHistoryUseCase } from '../application/get-cattle-activity-event-history.use-case';
import { ListActivityEventsUseCase } from '../application/list-activity-events.use-case';
import { RegisterActivityEventUseCase } from '../application/register-activity-event.use-case';
import { LocalActivityEventRepository } from './local-activity-event.repository';

export const sharedActivityEventRepository = new LocalActivityEventRepository();
export const sharedActivityEventCattleRepository = new LocalCattleRepository();
export const registerActivityEventUseCase = new RegisterActivityEventUseCase(
  sharedActivityEventRepository,
  sharedActivityEventCattleRepository
);
export const listActivityEventsUseCase = new ListActivityEventsUseCase(sharedActivityEventRepository);
export const getCattleActivityEventHistoryUseCase = new GetCattleActivityEventHistoryUseCase(
  sharedActivityEventRepository,
  sharedActivityEventCattleRepository
);
