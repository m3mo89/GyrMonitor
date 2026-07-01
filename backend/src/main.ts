import 'reflect-metadata';

import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';

import { AppModule } from './app.module';
import { appConfig } from './config/app.config';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule, new ExpressAdapter());

  app.enableCors({
    origin: ['http://127.0.0.1:5173', 'http://localhost:5173'],
    credentials: true
  });

  app.setGlobalPrefix(appConfig.apiPrefix);

  await app.listen(appConfig.port, appConfig.host);
  console.log(
    `GyrMonitor backend listening at http://${appConfig.host}:${appConfig.port}${appConfig.apiPrefix}`
  );
}

void bootstrap();
