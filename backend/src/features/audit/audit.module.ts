import { Module } from '@nestjs/common';
import { AuditService } from './audit.service';
import { AuditController } from './audit.controller';
import { BullModule } from '@nestjs/bullmq';
import { ANTRIAN_AUDIT_KONTRAK } from '../../shared/queue/queue.module';

@Module({
  imports: [
    BullModule.registerQueue({ name: ANTRIAN_AUDIT_KONTRAK }),
  ],
  controllers: [AuditController],
  providers: [AuditService],
  exports: [AuditService],
})
export class AuditModule {}
