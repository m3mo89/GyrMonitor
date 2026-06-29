import 'reflect-metadata';

import { AppModule } from './app.module';
import { appConfig } from './config/app.config';

async function bootstrap(): Promise<void> {
  void AppModule;
  void appConfig;
}

void bootstrap();
