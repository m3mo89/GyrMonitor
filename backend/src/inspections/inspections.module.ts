import { Module } from '@nestjs/common';

import { ObservationsController } from './http/observations.controller';

@Module({
  controllers: [ObservationsController]
})
export class InspectionsModule {}
