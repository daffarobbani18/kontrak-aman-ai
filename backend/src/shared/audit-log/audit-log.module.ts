import { Global, Injectable, Module } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.module';

export interface OpsiCatatAuditLog {
  penggunaId?: string;
  aksi: string;
  entitas: string;
  entitasId?: string;
  detailLama?: Record<string, unknown>;
  detailBaru?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
}

@Injectable()
export class AuditLogService {
  constructor(private readonly prisma: PrismaService) {}

  /** Catat aktivitas ke tabel audit_logs */
  async catat(opsi: OpsiCatatAuditLog): Promise<void> {
    await this.prisma.auditLog.create({
      data: {
        user_id: opsi.penggunaId ?? null,
        action: opsi.aksi,
        entity: opsi.entitas,
        entity_id: opsi.entitasId ?? null,
        old_data: opsi.detailLama ? (opsi.detailLama as unknown as import('@prisma/client').Prisma.InputJsonValue) : undefined,
        new_data: opsi.detailBaru ? (opsi.detailBaru as unknown as import('@prisma/client').Prisma.InputJsonValue) : undefined,
        ip_address: opsi.ipAddress ?? null,
        user_agent: opsi.userAgent ?? null,
      },
    });
  }
}

@Global()
@Module({
  providers: [AuditLogService],
  exports: [AuditLogService],
})
export class AuditLogModule {}
