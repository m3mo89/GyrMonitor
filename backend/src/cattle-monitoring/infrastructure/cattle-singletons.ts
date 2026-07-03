import { GetCattleDetailUseCase } from '../application/get-cattle-detail.use-case';
import { ListCattleUseCase } from '../application/list-cattle.use-case';
import { sharedCattleRepository } from './cattle-repository-singleton';

export const listCattleUseCase = new ListCattleUseCase(sharedCattleRepository);
export const getCattleDetailUseCase = new GetCattleDetailUseCase(sharedCattleRepository);
