import 'reflect-metadata';

import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import { AppModule } from './app.module';
import { appConfig } from './config/app.config';
import { DomainErrorFilter } from './shared/http/domain-error.filter';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule, new ExpressAdapter());

  app.enableCors({
    origin: ['http://127.0.0.1:5173', 'http://localhost:5173'],
    credentials: true
  });

  app.setGlobalPrefix(appConfig.apiPrefix);
  app.useGlobalFilters(new DomainErrorFilter());

  if (appConfig.swaggerEnabled) {
    const documentConfig = new DocumentBuilder()
      .setTitle('GyrMonitor Backend API')
      .setDescription('HTTP API for cattle monitoring, alerts, dashboard, and offline sync.')
      .setVersion('1.0')
      .addBearerAuth()
      .build();

    const document = SwaggerModule.createDocument(app, documentConfig);
    SwaggerModule.setup('api/docs', app, document);
  }

  await app.listen(appConfig.port, appConfig.host);
  console.log(
    `GyrMonitor backend listening at http://${appConfig.host}:${appConfig.port}${appConfig.apiPrefix}`
  );
}

void bootstrap();
