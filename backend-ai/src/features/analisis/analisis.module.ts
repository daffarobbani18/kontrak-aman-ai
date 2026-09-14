import { Module } from '@nestjs/common';
import { AnalisisService } from './analisis.service';

@Module({
  providers: [AnalisisService],
  exports: [AnalisisService],
})
export class AnalisisModule {}
