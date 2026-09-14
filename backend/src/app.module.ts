import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { ScheduleModule } from '@nestjs/schedule';
import { BullModule } from '@nestjs/bullmq';
import { appConfig, AppConfig } from './core/config/app.config';
import { PrismaModule } from './shared/prisma/prisma.module';
import { StorageModule } from './shared/storage/storage.module';
import { EmailModule } from './shared/email/email.module';
import { QueueModule } from './shared/queue/queue.module';
import { AuditLogModule } from './shared/audit-log/audit-log.module';
import { KuotaModule } from './shared/kuota/kuota.module';
import { AuthModule } from './features/auth/auth.module';
import { PenggunaModule } from './features/pengguna/pengguna.module';
import { DokumenKontrakModule } from './features/dokumen-kontrak/dokumen-kontrak.module';
import { AuditModule } from './features/audit/audit.module';
import { NegosiasiModule } from './features/negosiasi/negosiasi.module';
import { LanggananModule } from './features/langganan/langganan.module';
import { WebhookModule } from './features/webhook/webhook.module';
import { AdminModule } from './features/admin/admin.module';

@Module({
  providers: [
    // ThrottlerGuard sebagai global guard — berlaku untuk semua endpoint
    { provide: APP_GUARD, useClass: ThrottlerGuard },
  ],
  imports: [
    // ── Konfigurasi environment ──────────────────────────────────────────
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig],
      envFilePath: ['.env.local', '.env'],
      cache: true,
    }),

    // ── Rate limiting (throttler + Redis untuk multi-instance) ───────────
    ThrottlerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (cfg: ConfigService) => ({
        throttlers: [
          {
            // 100 permintaan per 60 detik per IP
            ttl: cfg.get<number>('THROTTLE_TTL', 60000),
            limit: cfg.get<number>('THROTTLE_LIMIT', 100),
          },
        ],
      }),
    }),

    // ── Jadwal cron ──────────────────────────────────────────────────────
    ScheduleModule.forRoot(),

    // ── Queue BullMQ (Redis) ─────────────────────────────────────────────
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (cfg: ConfigService) => ({
        connection: {
          host: cfg.get<string>('REDIS_HOST', '127.0.0.1'),
          port: cfg.get<number>('REDIS_PORT', 6379),
          password: cfg.get<string>('REDIS_PASSWORD'),
          tls: cfg.get<string>('REDIS_TLS') === 'true' ? {} : undefined,
        },
        defaultJobOptions: {
          attempts: 3,
          backoff: { type: 'exponential', delay: 5000 },
          removeOnComplete: { age: 86400, count: 1000 },
          removeOnFail: { age: 604800 },
        },
      }),
    }),

    // ── Shared modules (global) ───────────────────────────────────────────
    PrismaModule,
    StorageModule,
    EmailModule,
    QueueModule,
    AuditLogModule,
    KuotaModule,

    // ── Feature modules ──────────────────────────────────────────────────
    AuthModule,
    PenggunaModule,
    DokumenKontrakModule,
    AuditModule,
    NegosiasiModule,
    LanggananModule,
    WebhookModule,
    AdminModule,
  ],
})
export class AppModule {
  constructor(private readonly cfg: ConfigService) {
    // Validasi config saat startup
    const config = cfg.get<AppConfig>('app');
    if (!config) {
      throw new Error('Konfigurasi aplikasi tidak ditemukan');
    }
  }
}
