import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { NegosiasiService } from './negosiasi.service';
import { NegosiasiController } from './negosiasi.controller';
import { ANTRIAN_DRAF_NEGOSIASI } from '../../shared/queue/queue.module';

@Module({
  imports: [
    BullModule.registerQueue({ name: ANTRIAN_DRAF_NEGOSIASI }),
  ],
  controllers: [NegosiasiController],
  providers: [NegosiasiService],
  exports: [NegosiasiService],
})
export class NegosiasiModule {}
