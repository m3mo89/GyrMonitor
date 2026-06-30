import { GetCattleDetailUseCase } from '../application/get-cattle-detail.use-case';
import { GetCattleHistoryUseCase } from '../application/get-cattle-history.use-case';
import { ListCattleUseCase } from '../application/list-cattle.use-case';
import { sharedActivityEventRepository } from '../../activity-events/infrastructure/activity-event-singletons';
import { sharedCattleRepository } from './cattle-repository-singleton';

export const listCattleUseCase = new ListCattleUseCase(sharedCattleRepository);
export const getCattleDetailUseCase = new GetCattleDetailUseCase(sharedCattleRepository);
export const getCattleHistoryUseCase = new GetCattleHistoryUseCase(sharedCattleRepository, sharedActivityEventRepository);
