import { Module } from '@nestjs/common';

import { CattleController } from './http/cattle.controller';

@Module({
  controllers: [CattleController]
})
export class CattleMonitoringModule {}
