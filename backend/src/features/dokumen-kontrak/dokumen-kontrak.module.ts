import { Module } from '@nestjs/common';
import { DokumenKontrakService } from './dokumen-kontrak.service';
import { DokumenKontrakController } from './dokumen-kontrak.controller';
import { EmailModule } from '../../shared/email/email.module';

@Module({
  imports: [EmailModule],
  controllers: [DokumenKontrakController],
  providers: [DokumenKontrakService],
  exports: [DokumenKontrakService],
})
export class DokumenKontrakModule {}
