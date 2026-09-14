import { Global, Module, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { ConfigService } from '@nestjs/config';

/**
 * PrismaService — singleton wrapper PrismaClient dengan Prisma 7 + adapter pg.
 * Diregistrasi sebagai global agar bisa di-inject tanpa import PrismaModule.
 */
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly pool: Pool;

  constructor(databaseUrl: string) {
    const pool = new Pool({ connectionString: databaseUrl });
    const adapter = new PrismaPg(pool);
    super({ adapter } as ConstructorParameters<typeof PrismaClient>[0]);
    this.pool = pool;
  }

  async onModuleInit(): Promise<void> {
    await this.$connect();
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
  }
}

@Global()
@Module({
  providers: [
    {
      provide: PrismaService,
      inject: [ConfigService],
      useFactory: (cfg: ConfigService) => {
        const url = cfg.getOrThrow<string>('DATABASE_URL');
        return new PrismaService(url);
      },
    },
  ],
  exports: [PrismaService],
})
export class PrismaModule {}
