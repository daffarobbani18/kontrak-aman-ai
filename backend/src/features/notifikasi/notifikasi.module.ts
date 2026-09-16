import { Module } from '@nestjs/common';
import { NotifikasiController } from './notifikasi.controller';
import { NotifikasiService } from './notifikasi.service';

@Module({
  controllers: [NotifikasiController],
  providers: [NotifikasiService],
  exports: [NotifikasiService],
})
export class NotifikasiModule {}
