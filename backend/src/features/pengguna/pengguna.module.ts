import { Module } from '@nestjs/common';
import { PenggunaService } from './pengguna.service';
import { PenggunaController } from './pengguna.controller';
import { StorageModule } from '../../shared/storage/storage.module';
import { EmailModule } from '../../shared/email/email.module';

@Module({
  imports: [StorageModule, EmailModule],
  controllers: [PenggunaController],
  providers: [PenggunaService],
  exports: [PenggunaService],
})
export class PenggunaModule {}
