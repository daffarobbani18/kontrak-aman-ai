import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap(): Promise<void> {
  const logger = new Logger('bootstrap');
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['error', 'warn', 'log'],
  });

  logger.log('Backend AI worker berjalan — menunggu pekerjaan dari antrian...');

  // Tangani shutdown graceful
  const signals: NodeJS.Signals[] = ['SIGTERM', 'SIGINT'];
  for (const signal of signals) {
    process.on(signal, async () => {
      logger.log(`Menerima ${signal}, menutup aplikasi...`);
      await app.close();
      process.exit(0);
    });
  }
}

bootstrap().catch((err: unknown) => {
  console.error('Gagal menjalankan backend-ai:', err);
  process.exit(1);
});
