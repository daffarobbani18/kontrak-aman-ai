import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { NegosiasiService } from './negosiasi.service';
import { NegosiasiController } from './negosiasi.controller';
import { ANTRIAN_DRAF_NEGOSIASI } from '../../shared/queue/queue.module';
import { NotifikasiModule } from '../notifikasi/notifikasi.module';

@Module({
  imports: [
    BullModule.registerQueue({ name: ANTRIAN_DRAF_NEGOSIASI }),
    NotifikasiModule,
  ],
  controllers: [NegosiasiController],
  providers: [NegosiasiService],
  exports: [NegosiasiService],
})
export class NegosiasiModule {}
