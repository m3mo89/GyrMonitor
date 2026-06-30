import 'reflect-metadata';

import { NestFactory } from '@nestjs/core';

import { AppModule } from './app.module';
import { appConfig } from './config/app.config';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix(appConfig.apiPrefix);

  await app.listen(appConfig.port, appConfig.host);
  console.log(
    `GyrMonitor backend listening at http://${appConfig.host}:${appConfig.port}${appConfig.apiPrefix}`
  );
}

void bootstrap();
