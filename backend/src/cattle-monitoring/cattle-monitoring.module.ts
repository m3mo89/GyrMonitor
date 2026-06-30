import { Module } from '@nestjs/common';

import { GetCattleDetailUseCase } from './application/get-cattle-detail.use-case';
import { GetCattleHistoryUseCase } from './application/get-cattle-history.use-case';
import { ListCattleUseCase } from './application/list-cattle.use-case';
import { CattleController } from './http/cattle.controller';
import { getCattleDetailUseCase, getCattleHistoryUseCase, listCattleUseCase } from './infrastructure/cattle-singletons';

@Module({
  controllers: [CattleController],
  providers: [
    { provide: ListCattleUseCase, useValue: listCattleUseCase },
    { provide: GetCattleDetailUseCase, useValue: getCattleDetailUseCase },
    { provide: GetCattleHistoryUseCase, useValue: getCattleHistoryUseCase }
  ]
})
export class CattleMonitoringModule {}
