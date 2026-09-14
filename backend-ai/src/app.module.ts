import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { BullModule } from '@nestjs/bullmq';
import { aiConfig } from './config/ai.config';
import { OcrModule } from './features/ocr/ocr.module';
import { AnalisisModule } from './features/analisis/analisis.module';
import { AuditWorker } from './workers/audit.worker';
import { NegosiasiWorker } from './workers/negosiasi.worker';

/** Nama antrian — harus sama dengan backend-api */
export const ANTRIAN_AUDIT_KONTRAK = 'antrian:audit-kontrak';
export const ANTRIAN_DRAF_NEGOSIASI = 'antrian:draf-negosiasi';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [aiConfig],
      envFilePath: ['.env.local', '.env'],
      cache: true,
    }),

    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (cfg: ConfigService) => ({
        connection: {
          host: cfg.get<string>('REDIS_HOST', '127.0.0.1'),
          port: cfg.get<number>('REDIS_PORT', 6379),
          password: cfg.get<string>('REDIS_PASSWORD'),
          tls: cfg.get<string>('REDIS_TLS') === 'true' ? {} : undefined,
        },
      }),
    }),

    BullModule.registerQueue(
      {
        name: ANTRIAN_AUDIT_KONTRAK,
        defaultJobOptions: {
          attempts: 3,
          backoff: { type: 'exponential', delay: 5000 },
          removeOnComplete: 100,
          removeOnFail: 50,
        },
      },
      {
        name: ANTRIAN_DRAF_NEGOSIASI,
        defaultJobOptions: {
          attempts: 3,
          backoff: { type: 'exponential', delay: 5000 },
          removeOnComplete: 100,
          removeOnFail: 50,
        },
      },
    ),

    OcrModule,
    AnalisisModule,
  ],
  providers: [AuditWorker, NegosiasiWorker],
})
export class AppModule {}
