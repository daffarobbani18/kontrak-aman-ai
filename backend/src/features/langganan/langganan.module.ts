import { Module } from '@nestjs/common';
import { LanggananService } from './langganan.service';
import { LanggananController } from './langganan.controller';
import { MayarService } from './mayar.service';
import { KuotaModule } from '../../shared/kuota/kuota.module';

@Module({
  imports: [KuotaModule],
  controllers: [LanggananController],
  providers: [LanggananService, MayarService],
  exports: [LanggananService],
})
export class LanggananModule {}
