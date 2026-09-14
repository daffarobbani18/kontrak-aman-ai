import { Global, Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';

/** Nama antrian BullMQ */
export const ANTRIAN_AUDIT_KONTRAK = 'antrian:audit-kontrak';
export const ANTRIAN_DRAF_NEGOSIASI = 'antrian:draf-negosiasi';

/**
 * QueueModule — registrasi dua antrian BullMQ.
 * Diekspos secara global agar feature modules bisa inject Queue tanpa import ulang.
 */
@Global()
@Module({
  imports: [
    BullModule.registerQueue(
      { name: ANTRIAN_AUDIT_KONTRAK },
      { name: ANTRIAN_DRAF_NEGOSIASI },
    ),
  ],
  exports: [BullModule],
})
export class QueueModule {}
