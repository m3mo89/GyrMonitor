import { Module } from '@nestjs/common';

import { AuthenticationController } from './http/authentication.controller';

@Module({
  controllers: [AuthenticationController]
})
export class AuthenticationModule {}
